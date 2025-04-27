import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { toast, Toaster } from "react-hot-toast";

const Toast = ({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) => {
  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white`}
    >
      {message}
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [orderData, setOrderData] = useState({
    names: "",
    postalCode: "",
    country: "",
    city: "",
    address: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToastMessage = (
    message: string,
    type: "success" | "error",
    duration: number = 3000,
    callback?: () => void
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      if (callback) callback();
    }, duration);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Моля, влезте в профила си преди да направите поръчка");
      return;
    }
    const { names, postalCode, country, city, address, phone } = orderData;
    if (!names || !postalCode || !country || !city || !address || !phone) {
      toast.error("Моля, попълнете всички полета", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }
    toast.success("Обработване на поръчката...", {
      duration: 3000,
      position: "top-center",
    });
    try {
      const response = await fetch(
        "https://sportzone-api.onrender.com/api/Orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to submit order");
      }
      toast.success("Поръчката беше направена успешно!", {
        duration: 2000,
        position: "top-center",
      });
      setTimeout(() => {
        toast.success("Благодарим ви за поръчката!", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#4CAF50",
            color: "#fff",
            fontSize: "1.1rem",
            padding: "1rem 2rem",
            borderRadius: "0.5rem",
          },
        });
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Възникна грешка при изпращането на поръчката");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      {showToast && <Toast message={toastMessage} type={toastType} />}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Назад
        </button>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Информация за поръчката
            </h1>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label
                    htmlFor="names"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Имена <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="names"
                    name="names"
                    value={orderData.names}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете пълното си име"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Пощенски код <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={orderData.postalCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете пощенски код"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Държава <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={orderData.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете държава"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Град <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={orderData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете град"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Адрес <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={orderData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете пълен адрес"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={orderData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                      transition duration-150 ease-in-out
                      placeholder-gray-400 text-gray-900
                      hover:border-gray-400"
                    placeholder="Въведете телефонен номер"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Завърши поръчката
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
