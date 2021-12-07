import React from 'react';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

const api = {
  public_key: '38cd79b5f2b2486d86f562e3c43034f8',
  private_key: '8e49ff607b1f46e1a5e8f6ad5d312a80',
};


function App() {
  const [requestToken, setRequestToken] = useState();
  const [accessToken, setAccessToken] = useState();
  const [ordersList, setOrdersList] = useState();
  const [inputValue, setInputValue] = useState('');
  const [isOrdersFetched, setIsOrdersFetched] = useState(false);
  const isRequestTokenSet = useRef(false);

  const handleInput = (event) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    const getRequestToken = async () => {
      try {
        const response = await axios.get(`/oauth/requesttoken`);
        setRequestToken(response.data.RequestToken);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          alert(error.response.data);
        }
      }
    };

    getRequestToken();
  }, []);

  useEffect(() => {
    if (isRequestTokenSet.current) {
        const { createHash } = require ('crypto');
        const hash = createHash('sha1');
        hash.update(`${requestToken}${api.private_key}`);
        const password = hash.digest('hex');

        const getAccessToken = async () => {
          try {
            const response = await axios.get(`/oauth/accesstoken?oauth_token=${requestToken}&grant_type=api&username=${api.public_key}&password=${password}`);
            setAccessToken(response.data.AccessToken);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              alert(error.response.data);
            }
          }
        };

        getAccessToken();
        
    } else {
      isRequestTokenSet.current = true;
    }
  }, [requestToken]);

  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (accessToken !== undefined) {
      const getOrderList = async () => {
        try {
          const response = await axios.get(`/orders?oauth_token=${accessToken}&take=${inputValue}`);
          setOrdersList(response.data.Result);
          setIsOrdersFetched(true);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            alert(error.response.data);
          }
        }
      };
      getOrderList();
    }

    return;
  };

  let renderedOrders;
  if  (isOrdersFetched) {
    renderedOrders = ordersList.map((order) => {
      return (
        <tr key={order.Id}>
          <td>{new Date(Number(order.DateCreated.slice(6, 19))).toLocaleString()}</td>
          <td>{order.Id}</td>
          <td>{order.Title}</td>
          <td>{order.Status}</td>
          <td>{order.PaymentStatus}</td>
          <td>{order.Price}</td>
        </tr>
      );
    });
  }

  return (
    <div className="App">
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Type how many orders to display (1-50)" onChange={handleInput}/>
      <button type="submit">Submit</button>
    </form>
    {isOrdersFetched ?
      <table>
        <thead>
         <tr>
            <th>Date of Creation</th>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Payment Status</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {renderedOrders}
        </tbody>
      </table> : null}
    </div>
  );
}

export default App;
