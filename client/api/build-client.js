import axios from "axios";

const buildClient = ({req}) => {
  if (typeof window === "undefined") {
    //on the server
    return axios.create({
      baseURL: 'http://montys-tickets.one/',
      headers: req.headers, 
    })
  } else {
    //in the browser
    return axios.create({
      baseURL: '/'
    })
  }
}

export default buildClient;