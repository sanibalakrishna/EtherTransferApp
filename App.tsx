/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import './global';
import React, {useState} from 'react';
import type {PropsWithChildren} from 'react';
// import {ethers} from 'ethers';
import Web3 from 'web3';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Colors from './Constants/Colors';
import AnimatedLottieView from 'lottie-react-native';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SectionProps = PropsWithChildren<{
  title: string;
}>;
// const provider = new ethers.JsonRpcProvider(
//   'https://rpc-mumbai.maticvigil.com',
// );
const web3 = new Web3(
  new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'),
);

const MyInput = ({label, error, ...rest}: any): JSX.Element => {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  return (
    <View style={styles.container}>
      <TextInput
        {...rest}
        style={[
          styles.inputi,
          {color: Colors[colorScheme ?? 'light'].text},
          isFocused && styles.focusedInput,
          error && styles.errorInput,
        ]}
        placeholderTextColor={Colors[colorScheme ?? 'light'].text}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused ? '' : label}
      />
      <View
        style={
          isFocused
            ? [
                styles.labelContainer,
                {backgroundColor: Colors[colorScheme ?? 'light'].background},
              ]
            : styles.lablenull
        }>
        <Text style={isFocused && styles.label}>{label}</Text>
      </View>
    </View>
  );
};
function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const colorScheme = useColorScheme();
  const [status, setStatus] = useState('');
  const [address, setAddress] = useState('');
  const [eth, setEth] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [polygonscan, setPolygonscan] = useState('');
  const [errors, setErrors] = useState([false, false]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : 'white',
  };
  const textStyle = {
    color: isDarkMode ? 'white' : 'black',
  };
  const sendEth = () => {
    const temperrors = [false, false];
    if (address == '' || eth == '') {
      if (address == '') {
        temperrors[0] = true;
      }
      if (eth == '') {
        temperrors[1] = true;
      }
      setErrors(temperrors);
    } else if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      temperrors[0] = true;
      setErrors(temperrors);
    } else {
      setErrors([false, false]);
      try {
        setLoading(true);
        setStatus('');
        if (!web3.utils.isAddress(address)) {
          setStatus('Transaction error: Please Enter a valid Ethereum Address');
          setModalVisible(true);
          setLoading(false);
          return;
        }
        const privateKey =
          '55aad32f4f4504b202a80438e3154728e4a63924363659ca46e4172b7ee8f989';
        const senderAddress = '0xDff151487a0cFe5E8082e517256C414554B2d1C0';
        web3.eth.getGasPrice().then((gasPrice: any) => {
          // Get the sender's account nonce
          web3.eth.getTransactionCount(senderAddress).then((nonce: any) => {
            // Create the transaction object
            const txObject = {
              nonce: nonce,
              to: address,
              value: web3.utils.toWei(eth, 'ether'), // replace with the amount you want to send
              gasPrice: gasPrice,
              gasLimit: 21000, // standard gas limit for a simple ether transfer
            };

            // Sign the transaction with the sender's private key
            web3.eth.accounts
              .signTransaction(txObject, privateKey)
              .then((signedTx: any) => {
                // Send the signed transaction to the network
                web3.eth
                  .sendSignedTransaction(signedTx.rawTransaction)
                  .on('receipt', (receipt: any) => {
                    console.log('Transaction hash:', receipt.transactionHash);
                    console.log('Gas used:', receipt.gasUsed);
                    setStatus('Transaction hash:' + receipt.transactionHash);
                    setPolygonscan(
                      'https://mumbai.polygonscan.com/tx/' +
                        receipt.transactionHash,
                    );
                    setModalVisible(true);
                    setLoading(false);
                  })
                  .on('error', (error: any) => {
                    console.log('Transaction error:', error);
                    setStatus('Transaction error:' + error);
                    setModalVisible(true);
                    setLoading(false);
                  });
              });
          });
        });
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }

    console.log(`Address:${address},Ether:${eth}`);
    console.log(errors);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              {
                backgroundColor: Colors[colorScheme ?? 'light'].modlebackground,
                shadowColor: Colors[colorScheme ?? 'light'].modalshowdow,
              },
            ]}>
            {status[12] == 'h' ? (
              <AnimatedLottieView
                source={require('./assets/success.json')}
                autoPlay
                style={styles.modallogo}
              />
            ) : (
              <AnimatedLottieView
                source={require('./assets/failure.json')}
                autoPlay
                style={styles.modallogo}
              />
            )}
            {status ? (
              <Text style={[styles.modalText, textStyle]}>{status}</Text>
            ) : (
              <ActivityIndicator />
            )}
            {status[12] == 'h' && (
              <Pressable
                style={[styles.button, styles.buttonClose, styles.butttontrans]}
                onPress={() => {
                  Linking.openURL(polygonscan);
                }}>
                <Text style={styles.textStyle}>View Transaction</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={[styles.sectionContainer, backgroundStyle]}>
        <Text style={[textStyle, styles.title]}>Ether Transfer</Text>

        <AnimatedLottieView
          source={require('./assets/ethereum.json')}
          autoPlay
          style={styles.ethereumLogo}
        />

        <MyInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          error={errors[0]}
        />
        <MyInput
          label="Eth"
          value={eth}
          onChangeText={setEth}
          keyboardType="numeric"
          error={errors[1]}
        />
        <TouchableOpacity
          style={styles.btn}
          onPress={!loading ? sendEth : () => {}}>
          {loading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : (
            <Text
              style={[
                styles.btntext,
                {color: Colors[colorScheme ?? 'light'].text},
              ]}>
              Send Eth
            </Text>
          )}
        </TouchableOpacity>
        {(errors[0] || errors[1]) && (
          <Text style={styles.errorMessage}>
            Please Enter Valid {errors[0] && 'Address'}{' '}
            {errors[0] && errors[1] && ','} {errors[1] && 'Ether'}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    position: 'relative',
    marginBottom: 16,
    width: '80%',
  },
  inputi: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  focusedInput: {
    borderColor: '#0077cc',
  },
  errorInput: {
    borderColor: '#ee0000',
  },
  labelContainer: {
    position: 'absolute',
    top: -8,
    left: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 12,
    color: '#0077cc',
  },
  lablenull: {
    display: 'none',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  titletag: {
    fontSize: 20,
    fontWeight: '500',
  },
  inputtag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 50,
  },

  fields: {
    width: '80%',
    marginTop: 30,
  },
  inputlabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  btn: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
    height: 50,
    marginTop: 30,
    borderRadius: 10,
  },
  btntext: {fontSize: 18, fontWeight: '400'},
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,

    borderRadius: 20,
    padding: 35,
    alignItems: 'center',

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    elevation: 2,
  },
  butttontrans: {
    backgroundColor: 'green',
  },
  buttonClose: {
    marginTop: 10,
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: 'red',
    marginTop: 10,
  },

  ethereumLogo: {
    height: 300,
    alignSelf: 'center',
  },
  modallogo: {
    height: 100,
    alignSelf: 'center',
  },
});

export default App;
