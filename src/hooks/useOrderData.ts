
import { useState, useCallback } from "react";

export interface OrderData {
  brandName: string;
  productName: string;
  brief: string;
  deadline: string;
  paymentMethod: string;
  acceptTerms: boolean;
}

export const useOrderData = () => {
  const [orderData, setOrderData] = useState<OrderData>({
    brandName: "",
    productName: "",
    brief: "",
    deadline: "",
    paymentMethod: "stripe",
    acceptTerms: false,
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOrderData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handlePaymentMethodChange = useCallback((value: string) => {
    setOrderData(prev => ({
      ...prev,
      paymentMethod: value,
    }));
  }, []);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setOrderData(prev => ({
      ...prev,
      acceptTerms: checked,
    }));
  }, []);

  return {
    orderData,
    handleInputChange,
    handlePaymentMethodChange,
    handleCheckboxChange,
  };
};
