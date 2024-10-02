import { Image, Text, TouchableOpacity, View } from "react-native"

export default function MyCode() {
    return (
        <View className={"flex-1 bg-white"}>
            {/* Cabeçalho */}
            <View className={"flex-row items-center justify-between p-4"}>
                <TouchableOpacity
                    onPress={() => {
                        /* Lógica para voltar */
                    }}
                >
                    <Text className={"text-lg"}>{"<"}</Text>
                </TouchableOpacity>
                <Text className={"text-lg font-semibold"}>QR Code</Text>
                <TouchableOpacity
                    onPress={() => {
                        /* Lógica para compartilhar */
                    }}
                >
                    <Text className={"text-lg"}>Compartilhar</Text>
                </TouchableOpacity>
            </View>

            {/* QR Code e informações */}
            <View className={"flex-1 items-center justify-center"}>
                {/* QR Code */}
                <View className={"rounded-lg bg-gray-200 p-8"}>
                    <Image
                        source={{ uri: "link_para_imagem_qrcode" }}
                        className={"h-40 w-40"}
                    />
                </View>

                {/* Código do usuário */}
                <Text className={"mt-4 text-lg font-bold"}>Meu código é:</Text>
                <Text className={"mt-2 text-2xl font-bold"}>00000</Text>
            </View>

            {/* Botão Scanear */}
            <TouchableOpacity
                className={"mx-12 my-6 rounded-full bg-green-700 p-4"}
                onPress={() => {
                    /* Lógica para escanear */
                }}
            >
                <Text className={"text-center text-lg font-bold text-white"}>
                    Scanear
                </Text>
            </TouchableOpacity>

            {/* Menu inferior */}
        </View>
    )
}
