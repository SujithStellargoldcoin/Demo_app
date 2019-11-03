import React, { Component } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Keyboard, BackHandler, Alert } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import CardView from 'react-native-cardview'
import Spinner from 'react-native-spinkit'
import { Actions } from 'react-native-router-flux'

export default class Dashboard extends Component {

    constructor() {
        super()
        this.state = {
            recipient: '',
            amount: '',
            loading: false,
            buttonState: false,
            transferring: false,
            balance: 1000.00
        }
    }
    
    componentDidMount() {
        //Fetch wallet balance details here and store in the 'balance' state variable
    }
	
	UNSAFE_componentWillMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackButton)
	}

	UNSAFE_componentWillUnMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackButton)
	}

	handleBackButton = () => {
		if (Actions.currentScene == 'dashboard') {
			Alert.alert('Quit','Close the application?', 
			[{
				text: 'OK',
				onPress: () =>	BackHandler.exitApp()
			}], {
				cancelable: true
			})
			return true
		}
	};

    handleToUser = name => {
        this.setState({ recipient: name })
    }

    handleAmount = amount => {
        this.setState({ amount: amount })
    }

    handleTransaction = () => {
        if( !this.state.recipient || !this.state.amount || this.state.amount > this.state.balance ) {
            return
        } else {
            Keyboard.dismiss()
            this.setState({ transferring: true, buttonState: true }, () => {
                setTimeout(() => {
                    this.setState({
                        recipient: '',
                        amount: '', 
                        transferring: false,
                        buttonState: false 
                    })
                    Actions.success()
                    this.updateBalance()
                }, 2000)
            })
        }
    }

    updateBalance = () => {
        const updateBalance = this.state.balance - this.state.amount
        this.setState({ balance: updateBalance })
    }

    removeLoginInfo = async() => {
        try {
            await AsyncStorage.setItem('loggedIn', 'false')
        } catch (error) {
            console.log(error)
        }
    }

    handleLogout = () => {
        this.setState({ loading: true }, () => {
            fetch('http://salty-temple-12472.herokuapp.com/users/logout', {
            method: 'POST',
            })
            .then(response => response.json())
            .then(responseJson => {
				this.setState({ loading: false })
				if(responseJson.success === true) {
					this.removeLoginInfo()
					Actions.replace('home')
				} else {
					alert('Can\'t logout. Try again')
				}                
            })
            .catch(error => {
                this.setState({ loading: false })
                console.error(error)
            });
        })
    }   

    render() {
        const { loader, navbar, titleView, title, buttonView, button, buttonText, container, card, inputBox, cardTtitle, formLabel1, formLabel2,transferButton, transferIndicator } = styles
        const { loading: isLoading, balance } = this.state
        return (
            isLoading ?
            
            <View style = {loader}>
			    <ActivityIndicator size="large" color="#007acc"/> 
			</View>

            :

            <>
                <View style = {navbar}>
                    <View style = {titleView}>
                        <Text style = {title}>Your Wallet</Text> 
                    </View>
                    <View style = {buttonView}>
                        <TouchableOpacity style = {button} onPress = {this.handleLogout}>
                            <Text style = {buttonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style = {container}>
                    <CardView
                        cardElevation={5}
                        cardMaxElevation={7}
                        cornerRadius={5}>
                        <View style = {card}>
                            <Text style = {cardTtitle}>| Account</Text>
                            <Text style = {formLabel1}>To:</Text>
                            <TextInput style = {inputBox} value = {this.state.recipient} placeholder = "Recipient's name" onChangeText = {text => this.handleToUser(text)}/>
                            <Text style = {formLabel2}>Amount:</Text>
                            <TextInput style = {inputBox} keyboardType = 'numeric' value = {this.state.amount} placeholder = "Enter amount" onChangeText = {amount => this.handleAmount(amount)}/>
                        </View>
                        <View style = {{flexDirection: 'row'}}>
                            <View>
								<TouchableOpacity style = {transferButton} onPress = {this.handleTransaction} disabled = {this.state.buttonState}>
									{ 
										this.state.transferring ?
										
										<View style = {transferIndicator} >
											<Spinner isVisible={true} size={27} type='Wave' color='white'/>
										</View> 
										
										: 
										
										<Text style = {buttonText}>Send</Text>
									}
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style = {{ alignSelf: 'flex-end', marginLeft: 315, marginTop: 40, color:'grey', fontSize: 17 }}>Balance</Text>
                                <Text style = {{ alignSelf: 'flex-end', marginBottom: 20, fontSize: 18 }}><Text style = {{color: 'grey'}}>₹ </Text>${balance}</Text>
                            </View>
                        </View>
                    </CardView>
                </View>
            </>
        )
    }
}

const styles = StyleSheet.create({
    loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		transform: [{ scale: 1.5 }]
    },
    navbar: {
        flexDirection: 'row'
    },
    titleView: {
        flex: 2,
        justifyContent: 'flex-start'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2e4394',
        margin: 35,
        marginTop: 47
    },
    buttonView: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: 'flex-end'
    },
    button: {
        marginTop: 42,
        width: 90,
        backgroundColor: '#2e4394',
		padding: 12,
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25
	},
	cardTtitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#e17c00'
	},
	formLabel1: {
		fontSize: 17,
		marginTop: 15
	},
	formLabel2: {
		fontSize: 17,
		marginTop: 15
	},
    transferButton: {
        position: 'absolute',
        marginLeft: 25,
        marginTop: 42,
        width: 120,
        backgroundColor: '#0fb65e',
		padding: 12,
        borderRadius: 25,
    },
    buttonText: {
        fontSize: 16,
        textAlign: 'center',
        color: 'white'
    },
    container : {
        flex: 1,
        justifyContent: 'flex-start'
    },
    card: {
        marginHorizontal: 25,
        marginVertical: 20,
        height: 200
    },
    inputBox: {
		height: 40,
		width: 350,
		borderColor: '#000',
		borderWidth: 1,
        borderRadius: 12,
        paddingLeft: 20,
		marginTop: 15
	},
	transferIndicator: {
		flex:1,
		alignItems: 'center',
		justifyContent: 'center'
	}
})