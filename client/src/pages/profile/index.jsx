import { useAppStore } from '@/store'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from "react-icons/io5"
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { colors, getColor } from '@/lib/utils'
import { FaTrash, FaPlus } from "react-icons/fa"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { ADD_PROFILE_IMAGE_ROUTE, HOST, REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTES } from '@/utils/constants'

const Profile = () => {

  const { userInfo, setUserInfo } = useAppStore()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [image, setImage] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)

  const fileInputRef = useRef(null)

  useEffect(() => {
    if(userInfo.profileSetup){
      setFirstName(userInfo.firstName)
      setLastName(userInfo.lastName)
      setSelectedColor(userInfo.color)
    }

    if(userInfo.image){
      setImage(`${HOST}/${userInfo.image}`)
    }

  }, [userInfo])
  

  const validateProfile = () => {
    if(!firstName){
      toast.error("First name is required")
      return false;
    }
    if(!lastName){
      toast.error("Last name is required")
      return false;
    }

    return true;
  }

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(UPDATE_PROFILE_ROUTES,{firstName,lastName,color:selectedColor},{withCredentials:true})
        if(response.status === 200 && response.data){
          setUserInfo({...response.data})
          toast.success("Success")
          navigate("/chat")
        }
        
      } catch (error) {
        console.log("Error:", error);
        toast.error("Failed to update profile. Please try again.");
      }
    }
  };

  const handleNavigate = () => {
    if(userInfo.profileSetup){
      navigate('/chat')
    }else{
      toast.error("Please setup profile. ")
    }
  }
  
  const handleFileInputClick= () => {
    fileInputRef.current.click()
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if(file){
      const formData = new FormData()
      formData.append("profile-image",file)
      const res = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE,formData,{withCredentials:true})

      if(res.status === 200 && res.data.image){
        setUserInfo({...userInfo, image : res.data.image})
        toast.success("Image uploaded successfully. ")
      }

      // const reader = new FileReader();
      // reader.onload = () => {
      //   setImage(reader.result)
      // }

      // reader.readAsDataURL(file)
    }
  }

  const handleDeleteImage = async () => {
    try{
      const res = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {withCredentials : true})

      if(res.status === 200){
        setUserInfo({...userInfo, image:null})
        toast.success("Image removed successfully. ")
        setImage(null)
      }

    }catch(error){
      console.log(error)
    }
  }
  
  
  

  return (
    <div className='bg-gray-800 flex items-center justify-center flex-col gap-10 h-[100vh]'>
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div className="" onClick={handleNavigate}>
          <IoArrowBack className='h-12 w-12 text-4xl lg:text-6xl text-white/90 cursor-pointer' />
        </div>
        <div className="grid grid-cols-2">
          <div className="h-full md:w-48 md:h-48 relative flex items-center justify-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden" >
              {
                image ? <AvatarImage src={image} alt='profile' className='object-cover w-full h-full bg-black' /> : (
                  <div className={`uppercase h-32 w-32 md:h-48 md:w-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(selectedColor)} `}>
                    {
                      firstName ? firstName.split("").shift() : userInfo.email.split("").shift()
                    }
                  </div>
                )
              }
            </Avatar>
            {
              hovered && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer'
                onClick={image ? handleDeleteImage : handleFileInputClick}>
                  {image ? <FaTrash className='text-white text-3xl cursor-pointer' /> : <FaPlus className='text-white text-3xl cursor-pointer' />}
                </div>
              )
            }
            <input type='file' ref={fileInputRef} className='hidden' onChange={handleImageChange} name="profile-image" accept='.png, .jpg, .jpeg, .svg, .webp' />
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 items-center justify-center text-white ">
            <div className="w-full">
              <Input placeholder="Email" type="email" disabled value={userInfo.email} className='rounded-lg p-6 bg-[#2c2e3b] border-none' />
            </div>
            <div className="w-full">
              <Input placeholder="First Name" type="text" onChange={(e) => setFirstName(e.target.value)} value={firstName} className='rounded-lg p-6 bg-[#2c2e3b] border-none' />
            </div>
            <div className="w-full">
              <Input placeholder="Last Name" type="text" onChange={(e) => setLastName(e.target.value)} value={lastName} className='rounded-lg p-6 bg-[#2c2e3b] border-none' />
            </div>

            <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div 
                className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${ selectedColor === index ? "outline outline-white/50 outline-1 " : ""} `} 
                key={index} 
                onClick={()=>setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <Button className='h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-400' onClick={saveChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Profile