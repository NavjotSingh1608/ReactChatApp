import { useAppStore } from '@/store'
import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ChatContainer from './components/chat-container'
import EmptyChatContainer from './components/empty-chat-container'
import ContactsContainer from './components/contacts-container'

const Chat = () => {

  const {userInfo, selectedChatType, selectedChatData, isUploading, isDownloading, fileUploadProgress, fileDownloadProgress} = useAppStore()
  const navigate = useNavigate()

  useEffect(()=>{
    if(!userInfo.profileSetup){
      toast("Please set-up the profile to continue.")
      navigate("/profile")
    }
  },[userInfo,navigate])

  return (
    <div className='flex h-[100vh] text-white overflow-hidden'>
      {
        isUploading && <div className='h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg'>
          <h5 className='text-5xl animate-pulse'> File uploading </h5>
          {fileUploadProgress}%
        </div>
      }
      {
        isDownloading && <div className='h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg'>
          <h5 className='text-5xl animate-pulse'> Downloading file </h5>
          {fileDownloadProgress}%
        </div>
      }
      <ContactsContainer/>
      {
        selectedChatType === undefined ? <EmptyChatContainer/> : <ChatContainer/>
      }

    </div>
  )
}

export default Chat