import React, { useState } from 'react'
import Background from "/login2.png"
import Victory from "/victory.svg"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { LOGIN_ROUTES, SIGNUP_ROUTES } from '@/utils/constants'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'


const Auth = () => {

    const navigate = useNavigate()
    const {setUserInfo} = useAppStore()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmpassword, setConfirmPassword] = useState("")

    const validateSignUp = () =>{
        if(!email.length){
            toast.error("Email is required.");
            return false;
        }

        if(!password.length){
            toast.error("Password is required.");
            return false;
        }

        if(confirmpassword !== password){
            toast.error("Confirm password should be same as password.");
            return false;
        }

        return true;
    }
    const validateLogin = () =>{
        if(!email.length){
            toast.error("Email is required.");
            return false;
        }

        if(!password.length){
            toast.error("Password is required.");
            return false;
        }

        return true;
    }

    const handleLogin = async () => {
        if(validateLogin()){
            const response = await apiClient.post(LOGIN_ROUTES,{email,password}, {withCredentials:true});
            console.log({response});

            if(response.data.user.id){
                setUserInfo(response.data.user)
                if(response.data.user.profileSetup) navigate("/chat")
                else navigate("/profile")
            }
        }

     }

    const handleSignup = async () => {
        if(validateSignUp()){
            const response = await apiClient.post(SIGNUP_ROUTES,{email,password}, {withCredentials:true});
            console.log({response});
            if(response.status === 201){
                setUserInfo(response.data.user)
                navigate("/profile")
            }
        }

     }

    return (
        <>
            <div className="h-[100vh] w-[100vw] flex items-center justify-center ">
                <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
                    <div className="flex flex-col gap-10 items-center justify-center ">
                        <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center">
                                <h1 className="text-5xl font-bold lg:text-6xl" > Welcome </h1>
                                <img src={Victory} alt='victory image' className='h-[100px]' />
                            </div>
                            <p className="font-medium text-center pb-4">
                                Fill in the details to get started !!
                            </p>
                            <div className="flex items-center justify-center w-full">
                                <Tabs defaultValue='login' className='w-3/4'>
                                    <TabsList className='bg-transparent rounded-none w-full'>
                                        <TabsTrigger
                                            value="login"
                                            className='data-[state=active]:bg:transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-blue-500 p-4 transition-all duration-400'
                                        >
                                            Login
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="signup"
                                            className='data-[state=active]:bg:transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-blue-500 p-4 transition-all duration-400'
                                        >
                                            Signup
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent className='flex flex-col gap-4 mt-10' value='login' >
                                        <Input
                                            placeholder="Email"
                                            type="email"
                                            className="rounded-full p-4"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Password"
                                            type="password"
                                            className="rounded-full p-4"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <Button className="rounded-full p-6 bg-blue-500 " onClick={handleLogin}>
                                            Login
                                        </Button>
                                    </TabsContent>
                                    <TabsContent className='flex flex-col gap-4' value='signup' >
                                        <Input
                                            placeholder="Email"
                                            type="email"
                                            className="rounded-full p-4"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Password"
                                            type="password"
                                            className="rounded-full p-4"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Confirm Password"
                                            type="password"
                                            className="rounded-full p-4"
                                            value={confirmpassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <Button className="rounded-full p-6 bg-blue-500 " onClick={handleSignup}>
                                            SignUp
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                    <div className="hidden xl:flex justify-center items-center">
                        <img src={Background} alt='background logo' className='h-[400px]' />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Auth