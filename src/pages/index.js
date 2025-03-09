import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState('');

  // Cafe locations
  const cafeLocations = [
    {
      name: "Bottle Dream",
      address: "上海市长宁区利西路143号",
      dateRange: "April 4 - 8th",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3411.123456789012!2d121.4167!3d31.2183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDEzJzA1LjkiTiAxMjHCsDI1JzAwLjEiRQ!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus",
    },
    {
      name: "SparkLabs",
      address: "漕河泾开发区公园-东门 上海市徐汇区平果路与桂果路交叉口正南方向33米左右",
      dateRange: "April 8th - 11th",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3410.987654321098!2d121.4309!3d31.1704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDEwJzEzLjQiTiAxMjHCsDI1JzUxLjIiRQ!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus",
    },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = event.target.name.value;
    const phone = event.target.phone.value;
    const eventDate = event.target.eventDate.value;
    const timeBlock = event.target.timeBlock.value;

    // Combine data into a single object
    const data = JSON.stringify({ name, phone, eventDate, timeBlock });

    // Encrypt the data
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(12) },
      key,
      new TextEncoder().encode(data)
    );

    const exportedKey = await crypto.subtle.exportKey("raw", key);

    // Redirect to the ticket page with encrypted data and key
    window.location.href = `/ticket?data=${encodeURIComponent(
      btoa(String.fromCharCode(...new Uint8Array(encryptedData)))
    )}&key=${encodeURIComponent(btoa(String.fromCharCode(...new Uint8Array(exportedKey))))}`;
  };

  // Determine which map to display based on the selected date
  const selectedCafe = new Date(selectedDate) < new Date("2024-04-08")
    ? cafeLocations[0] // Bottle Dream
    : cafeLocations[1]; // SparkLabs

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Ticket</title>
      </Head>
      <h1>Create a Ticket</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="text" name="name" placeholder="Enter your name" required />
        <input type="tel" name="phone" placeholder="Enter your phone number" required />
        <input
          type="date"
          name="eventDate"
          min="2024-04-05"
          max="2024-04-11"
          required
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <select name="timeBlock" required>
          <option value="" disabled selected>Select time block</option>
          <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
          <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
          <option value="Evening (6 PM - 9 PM)">Evening (6 PM - 9 PM)</option>
        </select>
        <button type="submit">Generate Ticket</button>
      </form>

      <div className={styles.mapContainer}>
        <iframe
          src={selectedCafe.mapEmbedUrl}
          width="100%"
          height="400"
          style={{ border: "0", borderRadius: "15px" }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}