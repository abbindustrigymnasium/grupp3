import React from 'react';
import { 
	StyleSheet,
	View,
	Text,
	Switch,
	TouchableOpacity,
	Slider,
} from 'react-native';


export default class Component1 extends React.Component {

	constructor(props) {
    
        super(props);

        this.state = { // skapar alla variablar som vi kommer använda
			switchValue: false,
			name: "lampa",
			percent: 0,
			cold: false,
			warm: false,
			both: true,
			temp: 2,
			brightnessOutside: 0,
			checkTime: false,
			previousTime: 0,
			hour: 0,
		}
		setInterval(() => { // säger att determineAlertForBrightness ska köras varje sekund
			this.determineAlertForBrightness();
		  }, 1000);
		  setInterval(() => { // getBrightnessOutside ska också köra varje sekund
			this.getBrightnessOutside();
		  }, 1000);

	}

	determineAlertForBrightness =() => {
		this.getPreviousTime(); // callar getPreviousTime funktionen som hämtar data från databasen
		const date = new Date();
		const hour = date.getHours(); // hämtar tid just nu
		const brightness = this.state.brightnessOutside; // sätter staten till en lokal variabel
		if (hour % 2 == 0){ // varannan timme ska checkTime bli true
			this.setState({checkTime: true});
		} else {
			this.setState({checkTime: false});
		}
		//console.log(hour, this.state.previousTime);
		this.setState({hour: hour}); // sätter tiden i vårt state
		if (brightness > 900 && this.state.checkTime == true && this.state.previousTime != hour){ // om det är ljust och det är varannan timme och tiden har gått över till en ny timme.
			alert("It seems like there is plenty of light outside, is it necessary to keep your lamp on?");
			this.postPreviousTime(); // ändrar previoustime så att alerten bara körs en gång
		}
	}

	getPreviousTime =() => {
		fetch("http://iot.abbindustrigymnasium.se:3001/grupp3/lampa",{
			method: "GET"
		}).then((response) => response.json()).then((responseJSON) =>
	   {  																	
			this.setState({previousTime: responseJSON.previousTime}); //hämtar previoustime och sätter den i vårt state
	   })
	}

	postPreviousTime =() => { // sätter previoustime som tiden just nu
		console.log(this.state.hour, "hhh")
		const bodypart = JSON.stringify({

			name: this.state.name,

			previousTime: this.state.hour

		}); // skapar objektet som vi ska skicka
		fetch('http://iot.abbindustrigymnasium.se:3001/grupp3/', {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },

                body: bodypart // skickar bodypart objektet

            }).then((response) => response.json()).then(responseJson => {

                

                console.log(responseJson);

            }).catch((error)=>{

                console.log(error);

            });
	}

	componentDidMount (){ // ska köras direkt när appen laddas 
		fetch("http://iot.abbindustrigymnasium.se:3001/grupp3/lampa",{
			method: "GET"
		}).then((response) => response.json()).then((responseJSON) =>
	   {   	console.log("this.state");
		   	console.log(responseJSON);

			var realStrength = responseJSON.strength / 10;

			var realOnOrOff;
			   
			if (responseJSON.onoroff == 1){
				realOnOrOff = true;
			} else{
				realOnOrOff = false;
			}

			if (responseJSON.temperature == 2){
				this.setState({both: true, warm: false, cold: false});
			} else if (responseJSON.temperature == 1){
				this.setState({both: false, warm: false, cold: true});
			} else if (responseJSON.temperature == 0){
				this.setState({both: false, warm: true, cold: false});
			}

			this.setState({percent: realStrength});
			this.setState({switchValue: realOnOrOff}); // sätter alla states som datan i databasen. Detta för att kunna visa vad ljusstyrkan är vid detta tillfälle t.ex.
	   })
	}

	getBrightnessOutside =() => { // hämtar ljuset ute från databasen
		fetch("http://iot.abbindustrigymnasium.se:3001/grupp3/lampa",{
			method: "GET"
		}).then((response) => response.json()).then((responseJSON) =>
	   {  
			this.setState({brightnessOutside: responseJSON.brightness});
	   })
	}
	
	UpdateDataToServer =() => { // detta körs när vi uppdaterar lampans data

        const {name} = this.state;

		const {percent} = this.state;
		
		let {switchValue} = this.state;

		let {temp} = this.state;

		//hämtar alla states till lokala variablar

		if (this.state.switchValue === true){
			switchValue = 1;
		} else{
			switchValue = 0;
		} //ändrar formatet på switchValue för att sedan kunna skicka det till databasen. Vi undviker att använda booleans för att utnyttja integers egenskaper.

		if (this.state.warm === true){
			temp = 0;
		} else if (this.state.cold === true){
			temp = 1;
		} else if (this.state.both === true){
			temp = 2;
		}

    

        if(name !=''){
            const realValue = percent * 10;
            const bodypart = JSON.stringify({

                name: name,

				strength: realValue,
				
				onoroff: switchValue,

				temperature: temp,

            });

            console.log(bodypart);
            fetch('http://iot.abbindustrigymnasium.se:3001/grupp3/', {

                method: 'PATCH',

                headers: {

                    'Accept': 'application/json',

                    'Content-Type': 'application/json',

    

                },

                body: bodypart //skickar alla nya värden till databasen

            }).then((response) => response.json()).then(responseJson => {

                

                console.log(responseJson);
                console.log(percent);

                alert("New brightness successfully logged. Wait 5-10 seconds before it's changed.");

            }).catch((error)=>{

                console.log(error);

            });

            

        } 

        else

            alert('Name is empty') 

        }


    render() {

        if (!this.props.visible) {
            return false;
        }
        

        return (

            <View 
                style={styles.component}
            >

                <View style={styles.layouts}>

                	<View style={styles.layout1}>

                		<View style={styles.itemcontainer1}>

                			<View style={styles.itemcontainer1Inner}>

                                <View style={styles.item1}>
										<Text 
											style={styles.item1Text}
										>
											ABB
										</Text>
									</View>
									

                			</View>

                		</View>

                	</View>
                	<View style={styles.layout2}>

                		<View style={styles.itemcontainer2}>

                			<View style={styles.itemcontainer2Inner}>

                                <View style={styles.item2}>
										<Text 
											style={styles.item2Text}
										>
											On / Off
										</Text>
									</View>

                			</View>

                		</View>

                	</View>
                	<View style={styles.layout3}>

                		<View style={styles.itemcontainer3}>

                			<View style={styles.itemcontainer3Inner}>

                                <View style={styles.item3}>
										<Switch 
											value={this.state.switchValue}
											onValueChange={(val) => this.setState({ switchValue : val })} //ändrar switchvalue till true eller false
										/>
									</View>
									  

                			</View>

                		</View>

                	</View>
                	<View style={styles.layout4}>

                		{this.state.switchValue ? (<View style={styles.itemcontainer4}>

                			<View style={styles.itemcontainer4Inner}>

                                <View style={styles.item4}>
										<Text 
											style={styles.item4Text}
										>
											Brightness
										</Text>
										<Slider style={{ width: 300 }} step={1} minimumValue={1} marginTop={20} maximumValue={100} value={this.state.percent} 
						onValueChange={val => this.setState({ percent: val })} onSlidingComplete={ val => this.getVal(val)} // ändrar valuet på percent
						/> 
						<Text style={styles.welcome}> 
							  {this.state.percent}
						   </Text> 
									</View>
									

                			</View>

						</View>) : null}

                	</View>
					<View style={styles.layout4}>
					
						
							</View>
							<View style={styles.layoutTemp}>
					{this.state.switchValue ? (
						<View style={styles.itemcontainer4}>
						
						<View style={styles.itemcontainerWarmInner}>

						{this.state.warm ? (
							<View style={styles.itemcontainerWarmInner}>
							<TouchableOpacity style={styles.itemOn} onPress={()=> {this.setState({warm: true, cold: false, both: false})}}>
								<Text style={styles.item1TouchableOpacity}>
								Warm
								</Text>
			     			</TouchableOpacity>

			
							<TouchableOpacity style={styles.itemOff} onPress={()=> {this.setState({cold: true, warm: false, both: false})}}>
								<Text style={styles.item1TouchableOpacity}>
								Cold
								</Text>
							</TouchableOpacity>
						
						
							<TouchableOpacity style={styles.itemOff} onPress={()=> {this.setState({cold: false, warm: false, both: true})}}>
								<Text style={styles.item1TouchableOpacity}>
								Both
								</Text>
							</TouchableOpacity>

						</View>) : null}
						{this.state.cold ? ( // här säger vi om statet cold är true, ska koden nedan köras. Detta för att kunna visa vilken av Both, Cold eller Warm är på just nu.
							<View style={styles.itemcontainerWarmInner}>
							<TouchableOpacity style={styles.itemOff} onPress={()=> {this.setState({warm: true, cold: false, both: false})}}>
								<Text style={styles.item1TouchableOpacity}>
								Warm
								</Text>
							</TouchableOpacity>

			
							<TouchableOpacity style={styles.itemOn} onPress={()=> {this.setState({cold: true, warm: false, both: false})}}>
								<Text style={styles.item1TouchableOpacity}>
								Cold
								</Text>
							</TouchableOpacity>
						
						
							<TouchableOpacity style={styles.itemOff} onPress={()=> {this.setState({cold: false, warm: false, both: true})}}>
								<Text style={styles.item1TouchableOpacity}>
								Both
								</Text>
							</TouchableOpacity>

                           </View>) : null}
						{this.state.both ? (
							<View style={styles.itemcontainerWarmInner}>
							<TouchableOpacity style={styles.itemOff} onPress={()=> {this.setState({warm: true, cold: false, both: false})}}>
								<Text style={styles.item1TouchableOpacity}>
								Warm
								</Text>
							</TouchableOpacity>

			
							<TouchableOpacity style={styles.itemOff} onPress={()=> {this.setState({cold: true, warm: false, both: false})}}>
								<Text style={styles.item1TouchableOpacity}>
								Cold
								</Text>
							</TouchableOpacity>
						
						
							<TouchableOpacity style={styles.itemOn} onPress={()=> {this.setState({cold: false, warm: false, both: true})}}>
								<Text style={styles.item1TouchableOpacity}>
								Both
								</Text>
							</TouchableOpacity>
							</View>) : null}
						
									

						
						        
  </View>

						</View>) : null}
						
							</View>
							<View style={styles.layout5} >

                		<View style={styles.itemcontainer1}>

                			<View style={styles.itemcontainer1Inner}>

                                <View style={styles.item1}>
								<TouchableOpacity onPress={this.UpdateDataToServer}>
										
										<Text style={styles.item1TouchableOpacity}>
											Update
										</Text>
									
									</TouchableOpacity>
									</View>
									

                			</View>

                		</View>

                	</View>
							
							


						</View>


					</View>
                	

            
        );

    }

}



const styles = StyleSheet.create({
    
	component: {
	    width: '100%',
	    flexDirection: 'row',
	    backgroundColor: 'rgba(255,152,0,1)',
	    paddingLeft: 7.5,
	    paddingRight: 7.5,
	    paddingTop: 7.5,
		paddingBottom: 7.5,
		height: "100%",
	},
	
	layouts: {
	    flexDirection: 'row',
	    flexWrap: 'wrap',
	},
	
	layout1: {
	    width: '100%',
	    height: 90,
	},

	layout5: {
	    width: '100%',
		height: 90,
		marginTop: 170,
	},

	itemWarmButton: {
	    backgroundColor: '#1194f6',
	    borderWidth: 0,
	    borderColor: '#eee',
	    borderStyle: 'solid',
	    borderRadius: 4,
	    width: '100%',
	    height: '100%',
	    justifyContent: 'center',
	    alignItems: 'center',
	    overflow: 'hidden',
	    padding: 10,
	},

	itemWarmTouchableOpacity: {
	    color: '#fff',
	    fontSize: 14,
	    textAlign: 'center',
	    width: '100%',
	},
	
	itemcontainer1: {
	    width: '100%',
	    height: '100%',
	    paddingTop: 7.5,
	    paddingBottom: 7.5,
	    paddingLeft: 7.5,
		paddingRight: 7.5,
	},
	
	itemcontainer1Inner: {
	    width: '100%',
	    height: '100%',
	    position: 'relative',
	    alignItems: 'center',
	    justifyContent: 'center',
	},
	
	item1: {
	    width: '100%',
	    height: '100%',
	    alignItems: 'center',
	    justifyContent: 'center',
	    overflow: 'hidden',
	    padding: 10,
	    backgroundColor: 'rgba(96,96,96,1)',
	    borderStyle: 'solid',
	    borderWidth: 3,
	},

	itemOn: {
	    width: '25%',
	    height: '100%',
	    alignItems: 'center',
	    justifyContent: 'center',
	    overflow: 'hidden',
	    padding: 10,
	    backgroundColor: 'rgba(0, 216, 245, 1)',
	    borderStyle: 'solid',
		borderWidth: 3,
		marginLeft: 18,
	},

	itemOff: {
	    width: '25%',
	    height: '100%',
	    alignItems: 'center',
	    justifyContent: 'center',
	    overflow: 'hidden',
	    padding: 10,
	    backgroundColor: 'rgba(133, 162, 168, 1)',
	    borderStyle: 'solid',
		borderWidth: 3,
		marginLeft: 18,
	},
	
	item1Text: {
	    color: '#181818',
	    fontSize: 14,
	    textAlign: 'center',
	    width: '100%',
	},
	
	layout2: {
	    width: '58.333333333333336%',
	    height: 70,
	},
	
	itemcontainer2: {
	    width: '100%',
	    height: '100%',
	    paddingTop: 7.5,
	    paddingBottom: 7.5,
	    paddingLeft: 7.5,
	    paddingRight: 7.5,
	},
	
	itemcontainer2Inner: {
	    width: '100%',
	    height: '100%',
	    position: 'relative',
	    alignItems: 'center',
	    justifyContent: 'center',
	},
	
	item2: {
	    width: '100%',
	    height: '100%',
	    alignItems: 'center',
	    justifyContent: 'center',
	    overflow: 'hidden',
	    padding: 10,
	    backgroundColor: 'rgba(112,112,112,1)',
	    borderStyle: 'solid',
	    borderWidth: 3,
	},
	
	item2Text: {
	    color: '#181818',
	    fontSize: 14,
	    textAlign: 'center',
	    width: '100%',
	},
	
	layout3: {
	    width: '41.66666666666667%',
	    height: 70,
	},
	
	itemcontainer3: {
	    width: '100%',
	    height: '100%',
	    paddingTop: 7.5,
	    paddingBottom: 7.5,
	    paddingLeft: 7.5,
	    paddingRight: 7.5,
	},
	
	itemcontainer3Inner: {
	    width: '100%',
	    height: '100%',
	    position: 'relative',
	    alignItems: 'center',
	    justifyContent: 'center',
	},
	
	item3: {
	    width: '100%',
	    height: '100%',
	    alignItems: 'center',
	    justifyContent: 'center',
	    overflow: 'hidden',
	    backgroundColor: 'rgba(112,112,112,1)',
	    borderStyle: 'solid',
	    borderWidth: 3,
	},
	
	layoutTemp: {
	    width: '100%',
		height: 70,
		marginTop: -100,
	},

	layout4: {
	    width: '100%',
		height: 130,
	},

	
	itemcontainer4: {
	    width: '100%',
	    height: '100%',
	    paddingTop: 7.5,
	    paddingBottom: 7.5,
	    paddingLeft: 7.5,
	    paddingRight: 7.5,
	},
	
	itemcontainer4Inner: {
	    width: '100%',
	    height: '100%',
	    position: 'relative',
	    alignItems: 'center',
	    justifyContent: 'center',
	},

	itemcontainerWarmInner: {
	    width: '100%',
	    height: '100%',
		position: 'relative',
		flexDirection: "row",
	},

	itemcontainerColdInner: {
	    width: '100%',
	    height: '100%',
		position: 'absolute',
		alignItems: 'center',
	    justifyContent: 'center',
	},

	itemcontainerBothInner: {
	    width: '100%',
	    height: '100%',
		position: 'absolute',
		alignItems: 'right',
	},

	itemcontainerBothInner: {
	    width: '100%',
	    height: '100%',
	    position: 'relative',
	},
	
	item4: {
	    width: '100%',
	    height: '100%',
	    alignItems: 'center',
	    justifyContent: 'center',
	    overflow: 'hidden',
	    padding: 10,
	    backgroundColor: 'rgba(112,112,112,1)',
	    borderStyle: 'solid',
	    borderWidth: 3,
	},
	
	item4Text: {
	    color: '#181818',
	    fontSize: 14,
	    textAlign: 'center',
		width: '100%',
		marginTop: 15,
	},

	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	  },
	
});
