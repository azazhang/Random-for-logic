/*
        Random MIDI effect for Logic Pro V1.0.0
        A Logic pro Scripter preset that mimics Ableton Live Random MIDI effect
        By: JJJ_B 
        GitHub: https://github.com/deadtomb/Random-for-logic
        
*/

var TRACE = true; // every MIDI event is printed to console by default. you can disable it here.

var NOTE_TRACKING = {};
var CHANCE = 50;
var CHOICES = 12;
var MODE = 0; // 0 for random, 1 for Alt
var SCALE = 1;
var SIGN = 0; // 0 for add, 1 for Sub, 2 for Bi 
var STEP = 1; // current step in Alt mode 
var STEP_INVERT = 1;

function HandleMIDI (event) {
		if(event instanceof NoteOn) {
				if(ApplyChance(CHANCE)) { 
                    var originalNote = event.pitch;
                    var signNum = GetSign(SIGN);
                    if(MODE == 0) {
 						pitchOffset = Math.round(Math.random()*CHOICES);
                        event.pitch += pitchOffset*SCALE*signNum;
						// Trace("triggered");

                    }
                    if(MODE == 1) {
                        if (STEP >= CHOICES) {
                            STEP = 0;
                            STEP_INVERT *= -1;
                        }
                        pitchOffset = STEP * SCALE;
                        event.pitch += pitchOffset*signNum;
                        STEP += 1;
                    }
                    while(event.pitch > 127) {
                        event.pitch -= 12;
                    }
                    while(event.pitch < 0) {
                        event.pitch += 12;
                    }
		  			//keep track of the original and offset note pairs
		  			NOTE_TRACKING[originalNote] = event.pitch;

						event.send();

				} else {
						//send original note without offset
						event.send();   
                        // Trace("not triggered");
				}
                
		} else if (event instanceof NoteOff) {
				//if the pitch was paired to an offset pitch, get the offset pitch
				if(event.pitch in NOTE_TRACKING) {				
						var temp =	event.pitch;
						event.pitch = NOTE_TRACKING[event.pitch];							
						delete NOTE_TRACKING[temp];
				}
		
				event.send();
		
		} else {
				//send all other MIDI events
				event.send();
		}
		if (TRACE) {
			Trace(event);
		}
        
}

function ParameterChanged (param, value) {
		switch (param) {
				case 0:
						CHANCE = value;
						break;
				case 1: 
						CHOICES = value;
						break;
				case 2: 
						MODE = value;
						break;
				case 3:
						SCALE= value;
						break;
                case 4:
                        SIGN = value;
                        break;
				default:
						Trace ("ParameterChanged(): error: invalid parameter index");
		}
}


function ApplyChance(Chance) {   
		return  (Math.ceil(Math.random()*100) <= Chance) ? true : false;
}
function GetSign(sign) {
    switch (sign) {
        case 0: 
            return 1;
        case 1:
            return -1;
        case 2:
            if (MODE == 0) {
                return Math.sign(Math.random()-0.5);
            }
            else if (MODE == 1) {
                return STEP_INVERT;
            }
            break;
    }
}

//initialize PluginParameters
var PluginParameters = [{
		name:"Chance",
		minValue:0, 
		maxValue:100, 
		numberOfSteps:100, 
		defaultValue:50, 
		type:"linear",
		unit:"%"
}, {
		name:"Choices",
		minValue:1, 
		maxValue:24, 
		numberOfSteps:23, 
		defaultValue:12, 
		type:"linear",
		unit:""
}, {
		name:"Mode",
		valueStrings:["Random", "Alt"],
		defaultValue:0, 
		type:"Menu",
}, {
		name:"Scale",
		type:"linear",
		minValue:1,
		maxValue:24,
		numberOfSteps:23,
		defaultValue:1,
		unit:""
}, {
    name:"Sign",
    valueStrings:["Add", "Sub", "Bi"],
    defaultValue:0, 
    type:"Menu",
}];