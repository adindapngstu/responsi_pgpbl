import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function Notes() {
    return (
        <View style={{ padding: 20 }}>
            <TouchableOpacity onPress={() => router.push("/notes/journal")}>
                <Text>📓 Jurnal Harian</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/notes/checklist")}>
                <Text>🧳 Checklist Barang</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/notes/todo")}>
                <Text>✅ To-Do List</Text>
            </TouchableOpacity>
        </View>
    );
}
