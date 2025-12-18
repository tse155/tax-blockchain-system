/* 
    Interceptor: will intercept all our requests -> and add the correct headers
    headers -> where JTW tokens go

    Axios -> will intercept all requests sent, will see whether we have a valid accesss token and
    add the access token to the headers of the request. 
*/
import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

//api -> is a constant that holds an axios instance object
const api = axios.create({
    //to import environmental variables, they must start with VITE
    //with the following I will not be required to specify the baseURL just the specific path 
    baseURL : import.meta.env.VITE_API_URL
})


//This is an internal modification of the api instance
//We are registering an interceptor for the api instance, which modifies it internally
api.interceptors.request.use(
    
    //function to check whether we have an access token. If we do, we include that
    //As an authorization header to our request
    //config: is the request configuration object
    (config) =>
    {
        //Get the item that corresponds to ACESS_KEY
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(token){
            //If indeed we have a token we will embbed it in the headers as Bearer
            //config to modify just the headers for every single post or request we send to the specific endpoints
            config.headers.Authorization = `Bearer ${token}`
        }
        //If true we return the config with the token in headers. 
        //If false we still return the config but without any header
        return config
    },

    (error) => {
        return Promise.reject(error)
    }
)

export default api; 