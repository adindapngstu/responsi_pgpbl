import { Stack } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const TextInputExample = () => {
    const [nama, onChangeNama] = React.useState('');
    const [nim, onChangeNIM] = React.useState('');
    const [kelas, onChangeKelas] = React.useState('');

    const handleSave = () => {
        // Logika untuk menyimpan data bisa ditambahkan di sini
        // Misalnya, mengirim ke API atau menyimpan ke state global/lokal
        Alert.alert('Data Tersimpan', `Nama: ${nama}\nNIM: ${nim}\nKelas: ${kelas}`);
        // Reset form setelah disimpan (opsional)
        onChangeNama('');
        onChangeNIM('');
        onChangeKelas('');
    };

    return (
        <SafeAreaProvider>
            <Stack.Screen options={{ title: 'Form Input' }} />
            <SafeAreaView style={styles.container}>
                <View>
                    <Text style={styles.label}>Nama:</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChangeNama}
                        value={nama}
                        placeholder="Masukkan Nama Lengkap"
                    />
                    <Text style={styles.label}>NIM:</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChangeNIM}
                        value={nim}
                        placeholder="Masukkan Nomor Induk Mahasiswa"
                        keyboardType="default" // NIM bisa berisi huruf dan angka
                    />
                    <Text style={styles.label}>Kelas:</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChangeKelas}
                        value={kelas}
                        placeholder="Masukkan Kelas"
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Simpan</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between', // Mendorong tombol ke bawah
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        marginLeft: 12,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        borderColor: '#ccc',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 12,
        marginBottom: 20, // Memberi jarak dari bawah layar
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default TextInputExample;