import axios from "axios";

const server = axios.create({
    baseURL : `${window.location.protocol}//${window.location.hostname}:55432`,
    headers : {
        "Content-Type" : "application/json"
    }
});

function _r(action, params){
    return server.post(null, { action, params }, {
            validateStatus : (status) => status < 500,
        })
        .catch((err)=> {
            const { request, response } = err;
            if(response){
                return Promise.reject(response.data);
            }else if(request){
                return Promise.reject("Server unreachable");
            }else{
                return Promise.reject("Internal error.");
            }
        })
        .then(({ data, status })=>{
            return status === 200 ? Promise.resolve(data.result) : Promise.reject(data.error);
        });
}

let serverRequests = {
    getData      : ()=> _r("getData"),
    
    toggleServer : (action, server) => _r("toggleServer", { action, target : server }),

    createServer : (server, port) => _r("createServer", { name : server, port }),

    deleteServer : (server) => _r("deleteServer", { name : server }),

    createString : (name, server, directory) => _r("createString", { name, server, directory}),

    deleteString : (name, server) => _r("deleteString", { name, server})
}

export default serverRequests;