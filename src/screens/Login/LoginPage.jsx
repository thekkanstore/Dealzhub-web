import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import welcome1 from "../../assets/images/Welcome_01.png";
import welcome2 from "../../assets/images/Welcome_02.png";
import welcome3 from "../../assets/images/Welcome_03.png";
import appLogo from "../../assets/images/appLogo@2x.png";
import googleLogo from "../../assets/images/googleLogo@3x.png";
import { auth } from "../../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAppContext } from "../../context/AppContext";
import { checkIsUserRegistrationCompleted, getUserData } from "../../services/firestore";

const slides = [
    {
        image: welcome1,
        title: "New Products Everyday",
        subtitle: "Shopee adds new designs every day. Explore and find the best furniture for your home and offices.",
    },
    {
        image: welcome2,
        title: "Minimal Look Better Quality",
        subtitle: "Shopee adds new designs every day. Explore and find the best furniture for your home and offices.",
    },
    {
        image: welcome3,
        title: "Fastest Home Delivery",
        subtitle: "Shopee adds new designs every day. Explore and find the best furniture for your home and offices.",
    },
];

const LoginPage = () => {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();
    const { updateUser, updateNewUserStatus } = useAppContext();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            // Store user details in local storage
            localStorage.setItem('user', JSON.stringify({
                uid: user.providerData[0].uid,
                email: user.email,
                displayName: user.displayName,
                // Add any other relevant user data you want to store
            }));
            // IMPORTANT: Storing sensitive data like tokens directly in localStorage can be a security risk.
            // For production, consider more secure alternatives like HttpOnly cookies.
            updateUser(user);

            const userDoc = await getUserData(user.providerData[0].uid);

            if (userDoc) {
                if (userDoc.role && userDoc.role.length > 0) {
                    navigate("/home");
                    window.location.reload();
                } else {
                    navigate("/chooseusertype");
                    window.location.reload();
                }
            } else {
                navigate("/personaldetails");
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="hidden md:flex w-1/2 m-6 rounded-xl relative overflow-hidden bg-gray-100 items-center justify-center">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
                            }`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-16 flex justify-center flex-col w-full p-12">
                            <h2 className="text-3xl font-bold text-tertiaryTextColor">{slide.title}</h2>
                            <p className="text-gray-100 text-sm mt-2">{slide.subtitle}</p>
                        </div>
                    </div>
                ))}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${index === current ? "bg-primaryButtonBackgroundColor w-10" : "bg-gray-400"
                                }`}
                        ></div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col w-full md:w-1/2 justify-center items-center p-8 bg-white">
                <div className="max-w-sm w-full gap-12">
                    <div className="w-full justify-center flex">
                        <img
                            src={appLogo}
                            alt="App Logo"
                            className="w-40 h-40 object-cover"
                        />
                    </div>
                    <div className="w-full justify-center flex mt-4">
                        <button onClick={signInWithGoogle} className="p-4 bg-white gap-2 rounded-full w-10/12 flex items-center justify-center text-gray-700 text-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]">
                            <img
                                src={googleLogo}
                                alt="Google Logo"
                                className="w-6 h-6 object-cover"
                            />
                            Sign In with Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;