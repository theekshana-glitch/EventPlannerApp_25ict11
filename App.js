import React, {useState,useEffect} from "react";
import {
  View,Text,TextInput,Button,FlatList,StyleSheet,Alert,TouchableOpacity,Switch
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function App() {
  const[events,setEvents]=useState([]);
  const[currentScreen,setCurrentScreen]=useState('HOME');

const [title, setTitle]=useState('');
const [date, setDate]=useState('');
const [time, setTime]=useState('');
const [description, setDescription]=useState('');
const [reminder, setReminder]=useState(false);
const [editingId, setEditingId]=useState(null);

const [searchQuery, setSearchQuery]=useState('');

useEffect(()=>{
  loadEvents();
},[]);

useEffect(()=>{
  saveEvents(events);
},[events]);

const saveEvents =async (eventsToSave)=>{
  try{
    await
    AsyncStorage.setItem('@events',JSON.stringify(eventsToSave));
  }catch(e){
    console.error('Failed to save events',e);
  }
};

const loadEvents= async()=>{
  try{
    const storedEvents=await AsyncStorage.getItem('@events');
    if (storedEvents) 
      setEvents(JSON.parse(storedEvents));
    } catch (e){
      console.error('Failed to load events',e);
    }
  };

  
  const resetForm =()=>{
    setTitle('');setDate('');setTime('');setDescription('');setReminder(false);setEditingId(null);
  };

  const handleSaveEvent = ()=>{
    if (!title.trim()|| !date.trim()||!time.trim()) {
      Alert.alert('Missing Details','Please enter a name,date, and time.');
      return;
    }

    const newEvent ={
      id:editingId ||
      Date.now().toString(),
      title,date,time,description
    };

    if (editingId) {
      setEvents(events.map(ev => ev.id === editingId ? newEvent : ev));
    }else{
      setEvents([...events, newEvent]);
    }
    resetForm();
    setCurrentScreen('HOME');
  };

  const handleDeleteEvent =(id)=>{
    Alert.alert('Confirm Delete','Are you sure you want to delete this event?',[{
      text:'Cancel',style:'cancel'},{
        text:'Delete',style:'destructive',onPress:()=>{
          setEvents(events.filter(ev => ev.id !==id));
        }
    }]);
  };

  const handleEditPress = (event)=>{
    setTitle(event.title);
    setDate(event.date);
    setTime(event.time);
    setDescription(event.description);
    setEditingId(event.id);
    setCurrentScreen('ADD');
  };

  if (currentScreen === 'HOME') {
    const now=new Date();
    const filteredEvents = events.filter(ev => ev.title.toLowerCase().includes(searchQuery.toLowerCase())||
  ev.date.includes(searchQuery)).sort((a,b)=> new Date (`${a.date}T${a.time}`)-new Date (`${b.date}T${b.time}`));
  
  const upcoming = filteredEvents.filter(ev => new Date(`${ev.date}T${ev.time}`)>= now);
  
  const past = filteredEvents.filter(ev=> new Date(`${ev.date}T${ev.time}`)<now);
  
  return(
    <View style={styles.container}>
      <Text style={styles.header}>My Event Planner</Text>
      <TextInput style={styles.input}
      placeholder="Search the Name or date..."
      value={searchQuery}
      onChangeText={setSearchQuery}
      />

      <Button title="+ Create New Event" onPress={()=> setCurrentScreen('ADD')}/>
      
      <Text style={styles.subHeader}>Upcoming Events.</Text>
      {upcoming.length === 0 ? <Text style={styles.emptyText}>No upcoming events.</Text>:(
        <FlatList
        data={upcoming}
        keyExtractor={(item)=>item.id}
        renderItem={({item})=>(
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text>{item.date} at {item.time}</Text>
            <Text>{item.description}</Text>

            <View style={styles.buttonRow}>
              <Button title="Edit" onPress={() => handleEditPress(item)}/>
              <Button title="Delete" color="red" onPress={()=>
                handleDeleteEvent(item.id)
              }/>
            </View>
    </View>
  )}
  />

  )}

  <Text style={styles.subHeader}>Past Events</Text>
  {past.length === 0 ?<Text style={styles.emptyText}>No past events</Text>:(
    <FlatList
    data={past}
    keyExtractor={(item)=>item.id}
    renderItem={({item})=>(
      <View style={[styles.eventCard,{opacity:0.6}]}>

      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text>{item.date} at {item.time}</Text>

      </View>
    )}
    />
  )}
  </View>

);
}
return(
  <View style={styles.container}>
    <Text style={styles.header}>{editingId ? 'Edit Event' : 'Create Event'}</Text>
    <Text style={styles.label}>Event Name *</Text>
    <TextInput style={styles.input}placeholder="E.g. Team meeting" value={title} onChangeText={setTitle}/>

    <Text style={styles.label}>Date (yyyy-mm-dd) *</Text>
    <TextInput style={styles.input}placeholder="E.g. 2026-10-28" value={date} onChangeText={setDate}/>

    <Text style={styles.label}>Time (hh:mm) *</Text>
    <TextInput style={styles.input}placeholder="E.g. 15:45" value={time} onChangeText={setTime}/>

    <Text style={styles.label}>Description</Text>
    <TextInput style={[styles.input,{height: 80}]}multiline placeholder="Details..." value={description} onChangeText={setDescription}/>

    <View style={styles.switchRow}>
      <Text>Set Reminder notification</Text>
      <Switch value={reminder}onValueChange={setReminder}/>
    </View>

    <Button title="Save Event" onPress={handleSaveEvent}/>
    <View style={{marginTop: 10}}>
      <Button title="Cancel" color="Gray" onPress={()=>{
        resetForm();
        setCurrentScreen('HOME');
      }}/>

    </View>

  </View>
);

}

const styles = StyleSheet.create({
  container:{flex: 1,
    padding: 20,
    backgroundColor:'#f5f5f5'
  },
  header:{
    fontSize: 24,
    fontWeight:'bold',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 30
  },
  subHeader:{fontSize:18,
    fontWeight:'bold',
    marginTop: 15,
    marginBottom: 5
  },
  label:{
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10
  },
  input:{
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor:'#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  marginBottom: 10
  },
  eventCard:{backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor:'#ddd'
  },
  eventTitle:{
    fontSize: 18,
    fontWeight:'bold',
    marginBottom: 5
  },
  buttonRow:{
    flexDirection:'row',
    justifyContent: 'space-between',
    marginTop:10
  },
  emptyText:{
    fontStyle: 'italic',
    color:'grey',
    marginVertical: 5
  },
  switchRow:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginVertical: 15
  }
});