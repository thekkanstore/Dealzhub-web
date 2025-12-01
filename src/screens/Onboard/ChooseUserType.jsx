import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import chooseUserType1 from "../../assets/images/chooseUserType.png";
import chooseUserType2 from "../../assets/images/chooseUserType2.png";
import appLogo from "../../assets/images/appLogo@2x.png";
import { useAppContext } from "../../context/AppContext";
import { updateUserRoles } from "../../services/firestore";
import { Roles } from "../../config/common";

const slides = [
    {
        image: chooseUserType1,
        title: "Browse, shop, and interact with vendors.",
        subtitle: "Shopee adds new designs every day. Explore and find the best furniture for ypur home and offices.",
    },
    {
        image: chooseUserType2,
        title: "Manage your store and sell your products.",
        subtitle: "Shopee adds new designs every day. Explore and find the best furniture for ypur home and offices.",
    },
];

const ChooseUserType = () => {
    const [current, setCurrent] = useState(0);
    const { user } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleUserTypeSelection = async (role) => {
        if (user) {
            try {
                if (role === "vendor") {
                    navigate("/vendordetails");
                } else {
                    navigate("/home");
                }
            } catch (error) {
                console.error(error);
            }
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
                            loading="lazy"
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
                            loading="lazy"
                        />
                    </div>
                    <div className="w-full justify-center flex flex-col mt-4">
                        <div className="w-full justify-center flex">
                            <button onClick={() => handleUserTypeSelection(Roles.USER)} className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-full flex items-center justify-center text-white text-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]">
                                I’am an User & I’m Buying Items
                            </button>
                        </div>
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="text-gray-500 text-sm">OR</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                        <div className="w-full justify-center flex">
                            <button onClick={() => handleUserTypeSelection(Roles.VENDOR)} className="p-2 bg-secondaryButtonBackgroundColor gap-2 rounded-full w-full flex items-center justify-center text-gray-700 text-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]">
                                I’am a Business Owner & I’m Selling
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChooseUserType;
