import Dashboard from "../components/Dashboard";
import LoginForm from "@/components/login/LoginForm";
import HeaderPage from "@/components/landingPage/header";
import Information from "@/components/landingPage/information";
import Product from "@/components/landingPage/product";
import Project from "@/components/landingPage/project";


export default function UserDashboard() {
  return (
    <div className="dashboard-container">
      <HeaderPage />
      <Information />
      <Product />
      <Project />

    </div>
  );
}