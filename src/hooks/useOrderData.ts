
import { useState, useCallback } from "react";

export interface OrderData {
  brandName: string;
  productName: string;
  brief: string;
  deadline: string;
  requirements?: string;
  paymentMethod: string;
  acceptTerms: boolean;
  files: File[];
}

export const useOrderData = () => {
  const [orderData, setOrderData] = useState<OrderData>({
    brandName: "",
    productName: "",
    brief: "",
    deadline: "",
    requirements: "",
    paymentMethod: "stripe",
    acceptTerms: false,
    files: [],
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

  const handleFilesChange = useCallback((files: File[]) => {
    setOrderData(prev => ({
      ...prev,
      files,
    }));
  }, []);

  return {
    orderData,
    handleInputChange,
    handlePaymentMethodChange,
    handleCheckboxChange,
    handleFilesChange,
  };
};
