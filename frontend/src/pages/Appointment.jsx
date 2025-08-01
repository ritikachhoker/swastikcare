import React, {useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'
// import appointmentModel from '../../../backend/models/appointmentModel'
// import { daysOfWeek } from '../utils/daysOfWeek'

const Appointment = () => {

  const {docId} = useParams()
const {doctors, currencySymbol, backendUrl, token, getDoctorsData} = useContext(AppContext)
const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const navigate = useNavigate()

const[docInfo, setDocInfo] = useState(null)
// const[docSlots, setDocSlots] = useState([])
const [docSlots, setDocSlots] = useState([])
const[slotIndex, setSlotIndex] = useState(0)
const[slotTime, setSlotTime] = useState('')
console.log('docSlots:', docSlots);

 const fetchDocInfo = async()=>{
  const docInfo = doctors.find(doc=> doc._id === docId)
  setDocInfo(docInfo)
  
  
 }

 const getAvailableSlots = async()=>{
  console.log("Fetching available slots.....");
  setDocSlots([])

  // getting current date
  let today = new Date()
  console.log("Today's date:", today);
  let allTimeSlots = []
  for(let i=0 ; i<7 ; i++){
  //  getting date with index
  let currentDate = new Date(today)
  currentDate.setDate(today.getDate() + i)

  // setting endTime of the date with index
  let endTime = new Date(currentDate)
  // endTime.setDate(today.getDate() + 1)
  endTime.setHours(21,0,0,0)
//  console.log('currentDate:', currentDate);
//  console.log('endTime:', endTime);
  // setting hours
  if(today.getDate() === currentDate.getDate()){
    currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
    currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
  }else{
    currentDate.setHours(10)
    currentDate.setMinutes(0)
  }

  let timeSlots = []
  while(currentDate <endTime){
      let formattedTime = currentDate.toLocaleTimeString([],{hour :'2-digit', minute:'2-digit'})
    // add slot to array

    let day = currentDate.getDate()
    let month = currentDate.getMonth()+1
    let year = currentDate.getFullYear()

    const slotDate = day + "_" + month + "_" + year
    const slotTime = formattedTime

    const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

      if (isSlotAvailable) {
        // add slot to array
        timeSlots.push({
          datetime : new Date(currentDate),
          time : formattedTime
        })
      }

   
    // increment current time by 30 minutes
    currentDate.setMinutes(currentDate.getMinutes() + 30)
  }

  setDocSlots(prev=>([...prev,timeSlots]))
  }
 }

 const handleSlotClick = (index) => {
  setSlotIndex(index);
  setSlotTime(docSlots[index][0].time); // Assuming you want to set the time of the first slot of the selected day
};

const bookAppointment = async () => {
  if (!token) {
    toast.warn('Login to book appointment');
    return navigate('/login');
}

try {
    // Ensure that docSlots and slotIndex are valid
    if (docSlots.length === 0 || slotIndex < 0 || slotIndex >= docSlots.length) {
        toast.error('No available slots selected');
        return;
    }

    const date = docSlots[slotIndex][0].datetime; // Use slotIndex directly

    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    const slotDate = day + "_" + month + "_" + year
    // console.log(slotDate);

    const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } });
    if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate('/my-appointments');
    } else {
        toast.error(data.message);
    }

} catch (error) {
    console.log(error);
    toast.error(error.message);
}
}

useEffect(() => {
  console.log("Doctor Info:", docInfo); // Check if docInfo is set correctly
  if (docInfo) {
    getAvailableSlots();
  }
}, [docInfo]);



  useEffect(()=>{
   fetchDocInfo()
  },[doctors, docId])

  useEffect(()=>{
    getAvailableSlots
  },[docInfo])
  // useEffect(() => {
  //   const getAvailableSlots = async () => {
  //     // ...
  //   };
  //   getAvailableSlots();
  // }, [docInfo]);
  
  
  useEffect(()=>{
   console.log(docSlots);
  },[docSlots])

  return docInfo && (
    <div>
      {/* .........Doctor Details......... */}
      <div className='flex flex-col sm:flex-row gap-4 '>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt=""/>
           
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* ..........doc info- name, degree, experience......... */}
          <p className='flex items-center gap-2 text-2x1 font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt=''    />
            </p>
            <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
              <p>{docInfo.degree} - {docInfo.speciality}</p>
              <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
            </div>
            {/* .........doctor about.......... */}
            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                About <img src={assets.info_icon} alt=''/></p>
              <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
            </div>
            <p className='text-gray-500 font-medium mt-4'>
              Appointment Fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
            </p>
        </div>

      </div>
      {/* ............Booking Slots............. */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
           <p>Booking slots</p>
           <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
           { 
             docSlots.length >0 ?  ( docSlots.map((item, index) => (
            //  <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`} key={index}  >
            <div onClick={() => handleSlotClick(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`} key={index}>
              <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
             </div>
               ))
              ):(<p>No available slots</p> // Add this line to handle empty slots
                )}
           
           </div>
           <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
            {
              docSlots.length && docSlots[slotIndex].map((item, index)=>(
                <p onClick={()=> setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer  ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300' }`} key={index} >
                  {item.time.toLowerCase()}
                </p>
              ))
            }
           </div>
           
            <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>Book an Appointment</button>
           
      </div>
      <div>
        {/* ........Listing related doctors.......... */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality}/>
      </div>
    </div>
  )
}

export default Appointment 