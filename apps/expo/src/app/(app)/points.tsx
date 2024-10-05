import React from "react"
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { Link } from "expo-router"
import { useGetUserInformations } from "~/utils/transaction"

export default function ChatScreen() {
    const userInfo = useGetUserInformations().data
    

    return (
        <View className="flex-1">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View
                    style={{
                        backgroundColor: "#047857",
                        borderRadius: 12,
                        padding: 16,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: "#fff", fontSize: 18 }}>
                        Pontuação atual
                    </Text>
                    <Text
                        style={{
                            color: "#fff",
                            fontSize: 48,
                            fontWeight: "bold",
                        }}
                    >
                        {userInfo?.points}
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        marginVertical: 16,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            backgroundColor: "#E5E7EB",
                            padding: 12,
                            borderRadius: 8,
                        }}
                    >
                        <Link href={"/my-code"}>Receber</Link>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            backgroundColor: "#E5E7EB",
                            padding: 12,
                            borderRadius: 8,
                        }}
                    >
                        <Link href={"/send-points"}>Enviar</Link>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            backgroundColor: "#E5E7EB",
                            padding: 12,
                            borderRadius: 8,
                        }}
                    >
                        <Text>Resgatar</Text>
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        backgroundColor: "#065F46",
                        padding: 16,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                    }}
                >
                    <Text style={{ color: "#fff", fontSize: 20 }}>
                        Histórico
                    </Text>
                </View>

                <View
                    style={{
                        backgroundColor: "#fff",
                        shadowColor: "#000",
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                    }}
                >
                    {[
                        {
                            pontos: "+25 pontos",
                            data: "23 de setembro de 2024",
                        },
                        { pontos: "Resgatado", data: "23 de setembro de 2024" },
                        {
                            pontos: "+10 pontos",
                            data: "23 de setembro de 2024",
                        },
                        {
                            pontos: "+30 pontos",
                            data: "23 de setembro de 2024",
                        },
                    ].map((item, index) => (
                        <View
                            key={index}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                padding: 16,
                                borderBottomWidth: 1,
                                borderLeftWidth: 1,
                                borderRightWidth: 1,
                                borderBottomColor: "#E5E7EB",
                                borderLeftColor: "#E5E7EB",
                                borderRightColor: "#E5E7EB",
                            }}
                        >
                            <View>
                                <Text style={{ fontSize: 16 }}>
                                    {item.pontos}
                                </Text>
                                <Text style={{ color: "#6B7280" }}>
                                    Data: {item.data}
                                </Text>
                            </View>
                            <TouchableOpacity>
                                <Text style={{ color: "#047857" }}>→</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}
