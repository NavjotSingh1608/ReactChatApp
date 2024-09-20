import { Avatar, AvatarImage } from '@/components/ui/avatar'
import apiClient from '@/lib/api-client'
import { getColor } from '@/lib/utils'
import { useAppStore } from '@/store'
import { GET_CHANNEL_MESSAGES, GET_MESSAGES, HOST } from '@/utils/constants'
import { AvatarFallback } from '@radix-ui/react-avatar'
import moment from "moment"
import React, { useRef, useEffect, useState } from 'react'
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileAlt, FaFileArchive } from "react-icons/fa"
import { IoMdArrowRoundDown } from "react-icons/io"
import { IoCloseSharp } from 'react-icons/io5'


const MessageContainer = () => {

  const getFileIcon = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="text-red-200" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-200" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-200" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-orange-200" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FaFileArchive className="text-yellow-200" />;
      default:
        return <FaFileAlt className="text-gray-200" />;
    }
  };

  const scrollRef = useRef()
  const { selectedChatData, selectedChatType, userInfo, setSelectedChatMessages, selectedChatMessages, setIsDownloading, setFileDownloadProgress } = useAppStore()
  const [showImage, setShowImage] = useState(false)
  const [imageURL, setImageURL] = useState(null)


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedChatMessages])

  useEffect(() => {

    const getMessages = async () => {
      try {
        const res = await apiClient.post(GET_MESSAGES, { id: selectedChatData._id }, { withCredentials: true })
        if (res.data && res.data.messages) {
          setSelectedChatMessages(res.data.messages)
        }

      } catch (error) {
        console.log(error)
      }
    }

    const getChannelMessages = async() =>{
      try{
        const res = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`, { withCredentials: true })
        if (res.data && res.data.messages) {
          setSelectedChatMessages(res.data.messages)
        }
      }catch(error){
        console.log(error)
      }
    }

    if (selectedChatData._id) {
      if (selectedChatType === "contact") {
        getMessages()
      }else if(selectedChatType === "channel"){
        getChannelMessages()
      }
    }
  }, [selectedChatType, selectedChatData, setSelectedChatMessages])

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  }

  const downloadFile = async (file) => {
    setIsDownloading(true)
    setFileDownloadProgress(0)
    const res = await apiClient.get(`${HOST}/${file}`, { responseType: "blob", onDownloadProgress: (ProgressEvent) => { const { loaded, total } = ProgressEvent; const percentCompleted = Math.round((loaded * 100) / total); setFileDownloadProgress(percentCompleted) } })
    const urlBlob = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement("a")
    link.href = urlBlob
    link.setAttribute("download", file.split("/").pop())
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false)
    setFileDownloadProgress(0)
  }

  const renderMessages = () => {
    let lastDate = null
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD")
      const showDate = messageDate !== lastDate
      lastDate = messageDate
      return (
        <div key={message._id || index}>
          {showDate && (<div className='text-center text-gray-500 my-2'>
            {moment(message.timestamp).format("LL")}
          </div>)}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      )
    })
  }

  const renderDMMessages = (message) =>
    <div className={` ${message.sender === selectedChatData._id ? "text-left" : "text-right"}`}>
      {
        message.messageType === "text" && (
          <div className={`${message.sender !== selectedChatData._id ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-white/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words `}>
            {message.content}
          </div>
        )
      }
      {
        message.messageType === "file" && (
          <div className={`${message.sender !== selectedChatData._id ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-white/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words `}>
            {checkIfImage(message.fileURL) ? <div className='cursor-pointer' onClick={() => { setImageURL(message.fileURL); setShowImage(true) }} >
              <img src={`${HOST}/${message.fileURL}`} height={300} width={300} />
            </div> : <div className='flex items-center justify-center gap-4'>
              <span className='text-white/80 text-3xl bg-black/20 rounded-full p-3 '>
                {getFileIcon(message.fileURL)}
              </span>
              <span> {message.fileURL.split("/").pop()} </span>
              <span className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => downloadFile(message.fileURL)}>
                <IoMdArrowRoundDown />
              </span>
            </div>}
          </div>
        )
      }
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>

  const renderChannelMessages = (message) => {
    return (
      <div className={` mt-5  ${message.sender._id !== userInfo.id ? "text-left" : "text-right"} `} >
        {
          message.messageType === "text" && (
            <div className={`${message.sender._id === userInfo.id ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-white/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-8`}>
              {message.content}
            </div>
          )
        }
        {message.messageType === "file" && (
          <div className={`${message.sender._id === userInfo.id ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50" : "bg-[#2a2b33]/5 text-white/80 border-white/20"} border inline-block p-4 rounded my-1 max-w-[50%] break-words `}>
            {checkIfImage(message.fileURL) ? <div className='cursor-pointer' onClick={() => { setImageURL(message.fileURL); setShowImage(true) }} >
              <img src={`${HOST}/${message.fileURL}`} height={300} width={300} />
            </div> : <div className='flex items-center justify-center gap-4'>
              <span className='text-white/80 text-3xl bg-black/20 rounded-full p-3 '>
                {getFileIcon(message.fileURL)}
              </span>
              <span> {message.fileURL.split("/").pop()} </span>
              <span className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => downloadFile(message.fileURL)}>
                <IoMdArrowRoundDown />
              </span>
            </div>}
          </div>
        )}
        {
          message.sender._id !== userInfo.id ? <div className="flex items-center justify-start gap-3">
            <Avatar className="h-12 w-12 rounded-full overflow-hidden" >
              {
                message.sender.image && (
                  <AvatarImage src={`${HOST}/${message.sender.image}`} alt='profile' className='object-cover w-full h-full bg-black' />
                )}
              <AvatarFallback className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(message.sender.color)} `}>
                {message.sender.firstName ? message.sender.firstName.split("").shift() : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className='text-sm text-white/60' > {`${message.sender.firstName} ${message.sender.lastName} `}</span>
            <span className="text-xs text-gray-600">
              {moment(message.timestamp).format("LT")}
            </span>
          </div> : <span className="text-xs text-gray-600">
            {moment(message.timestamp).format("LT")}
          </span>
        }
      </div>
    )
  }


  return (
    <div className='p-4 h-[calc(100vh-12.5rem)] overflow-y-auto '>
      {
        selectedChatMessages && selectedChatMessages.length > 0 ? renderMessages() : (
          <div className='flex items-center justify-center text-gray-500 h-full w-full'>
            No messages yet
          </div>
        )
      }
      <div ref={scrollRef} />
      {
        showImage && (
          <div className="fixed top-0 left-0 z-50 w-full h-full flex items-center justify-center bg-black/90 p-4">
            <span className='absolute top-0 right-0 m-8 text-5xl cursor-pointer text-white' onClick={() => setShowImage(false)}>
              <IoCloseSharp />
            </span>
            <img src={`${HOST}/${imageURL}`} alt="image" className="max-w-full max-h-full" />
          </div>
        )
      }
    </div>
  )
}

export default MessageContainer
