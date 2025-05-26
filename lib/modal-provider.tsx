/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

// React, Next.js
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
// Prisma models and types
import { User } from '@prisma/client';

export type ModalData = {
  user?: User;
};

type ModalContextType = {
  data: ModalData;
  isOpen: boolean;
  setOpen: (modal: ReactNode, fetchData?: () => Promise<any>) => void;
  setClose: () => void;
}

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: () => {},
  setClose: () => {},
 })

export default function ModalProvider({children}: {children: ReactNode}) {
  const [isOpen, SetIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});
  const [showingModal, setShowingModal] = useState<ReactNode>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setOpen = async (modal:ReactNode, fetchData?: () => Promise<any>) => {
    if (modal) {
      if (fetchData) {
        setData({...data, ...(await fetchData())});
      }
      setShowingModal(modal);
      SetIsOpen(true);
    }
  }

  const setClose = () => {
    SetIsOpen(false);
    setData({});
  };

  if (!isMounted) return null;

  return (
    <ModalContext.Provider value={{data, isOpen, setOpen, setClose}}>
      {children}
      {showingModal}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error("useModal must be used within the modal provider!");
  }
  return context;
}
