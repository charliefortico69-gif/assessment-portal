import axios from "axios";

export async function login(email,password){
  const res = await axios.post("http://localhost:5000/auth/login",{
    email,
    password
  });
  return res.data;
}
