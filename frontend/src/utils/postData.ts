import axios from "axios";

export async function postData(link, data){
    try{
        const res = await axios.post(`http://localhost:3001/${link}`, data)
        return res.data
    }
    catch(err){
        return err
    }
}

export async function putData(link, id, data){
    try{
        const res = await axios.put(`http://localhost:3001/${link}/${id}`, data)
        return res.data
    }
    catch(err){
        return err
    }
}

export async function deleteData(link, id){
    console.log(id)
    try{
        const res = await axios.delete(`http://localhost:3001/${link}/${id}`)
        return res.data
    }
    catch(err){
        return err
    }
}
