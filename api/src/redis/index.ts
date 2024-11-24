import type { RedisClientType } from "redis"
import { createClient } from "redis"

import type { Notification, RecyclingTransaction } from "../drizzle/schema.ts"
import { env } from "../config/env.ts"

export interface PubSubEvents {
  notifyTransaction: (
    args:
      | {
          id: string
          type: "p2p"
          senderId: string
          receiverId: string
          description: string | null
          points: number
        }
      | {
          id: string
          type: "recycling"
          receiverId: string
          material: RecyclingTransaction["material"]
          weight: number
          description: string | null
          points: number
        },
  ) => void
}

export class RedisService {
  private static instance: RedisService
  private mainClient: RedisClientType
  private subscriberClient: RedisClientType
  private isConnected = false

  private constructor() {
    this.mainClient = createClient({
      url: env.REDIS_URL,
    })

    this.subscriberClient = this.mainClient.duplicate()

    this.subscriberClient.on("error", (error) => {
      console.error("Redis subscriber error:", error)
    })
  }

  public static getInstance(): RedisService {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!RedisService.instance) {
      RedisService.instance = new RedisService()
    }
    return RedisService.instance
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.mainClient.connect()
      await this.subscriberClient.connect()
      this.isConnected = true
    }
  }

  public async getClient(): Promise<RedisClientType> {
    await this.ensureConnection()
    return this.mainClient
  }

  public async getSubscriber(): Promise<RedisClientType> {
    await this.ensureConnection()
    return this.subscriberClient
  }

  public async publish<K extends keyof PubSubEvents>(
    channel: K,
    data: Parameters<PubSubEvents[K]>[0],
  ): Promise<void> {
    await this.ensureConnection()
    await this.mainClient.publish(channel, JSON.stringify(data))
  }

  public async subscribe<K extends keyof PubSubEvents>(
    channel: K,
    callback: PubSubEvents[K],
  ): Promise<void> {
    await this.ensureConnection()
    await this.subscriberClient.subscribe(channel, (message) => {
      const data = JSON.parse(message) as Parameters<PubSubEvents[K]>[0]
      callback(data)
    })
  }

  public async unsubscribe(channel: keyof PubSubEvents): Promise<void> {
    await this.ensureConnection()
    await this.subscriberClient.unsubscribe(channel)
  }

  async cache<T>(
    key: string | string[],
    callback: () => Promise<T>,
    expirationInSeconds?: number,
  ): Promise<T> {
    await this.ensureConnection()
    const cacheKey = Array.isArray(key) ? key.join(":") : key

    const cached = await this.mainClient.get(cacheKey)
    if (cached) {
      return JSON.parse(cached) as T
    }

    const result = await callback()
    if (expirationInSeconds) {
      await this.mainClient.setEx(cacheKey, expirationInSeconds, JSON.stringify(result))
    } else {
      await this.mainClient.set(cacheKey, JSON.stringify(result))
    }

    return result
  }

  async cacheDel(key: string | string[]): Promise<void> {
    await this.ensureConnection()

    const cacheKey = Array.isArray(key) ? key.join(":") : key
    await this.mainClient.del(cacheKey)
  }
}

export const redis = RedisService.getInstance()
