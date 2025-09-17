import RegisterForm from "@/components/login/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Bengkel App",
  description: "Register page for Bengkel App",
};

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <RegisterForm />
      </div>
    </div>
  );
}