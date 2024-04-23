import React, { FormEvent, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export default function Home() {
  const [payment, setPayment] = useState({
    user: "Daniel",
    cantidad: 0,
  });

  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayment(prevPayment => ({
      ...prevPayment,
      [name]: name === 'cantidad' ? parseInt(value) : value,
    }));
  };

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    const paymentData = {
      cantidad: Number(payment.cantidad), 
      user: payment.user,
    };

    try {
      const response = await fetch('http://54.147.14.218:4000/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      const result = await response.json();
      setAlert({ message: '¡Pago pendiente!', type: 'success' });
    } catch (error) {
      setAlert({ message: 'Error al procesar el pago.', type: 'error' });
    }
  };

  useEffect(() => {
    if (!socket) {
      socket = io('http://23.20.222.124:3000');
      socket.on('connect', () => {
        console.log('Socket connected');
      });
      socket.on('payment-processed', (payment) => {
        console.log(payment);
        setAlert({ message: '¡Pago confirmado!', type: 'success' });
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return (
    <main className="min-h-screen flex justify-center items-center bg-white">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col min-w-[400px]">
        <h1 className="text-3xl text-neutral-800 font-bold mb-4">Detalles del pago</h1>
        <div className="flex items-center mb-4">
          <label className="text-neutral-800 font-semibold text-lg">Usuario: {payment.user}</label>
        </div>
        <div className="flex items-center mb-4">
          <label className="text-neutral-800 font-semibold text-lg">Total:</label>
          <input
            type="number"
            name="cantidad"
            value={payment.cantidad}
            onChange={handleInputChange}
            className="ml-2 border border-b-black outline-none rounded p-2 text-black"
          />
        </div>
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}
        <form onSubmit={handlePayment} className="w-full">
          <button
            type="submit"
            className="bg-sky-800 text-white rounded p-2 font-semibold w-full"
          >
            Pagar
          </button>
        </form>
      </div>
    </main>
  );
}
