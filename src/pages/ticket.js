import Head from 'next/head';
import { useEffect, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import html2canvas from 'html2canvas';
import styles from '../styles/Home.module.css';

export default function Ticket() {
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    const decryptData = async (encryptedData, key) => {
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(12) },
        key,
        Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
      );
      return new TextDecoder().decode(decrypted);
    };

    const importKey = async (exportedKey) => {
      const keyData = Uint8Array.from(atob(exportedKey), c => c.charCodeAt(0));
      return await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
    };

    const urlParams = new URLSearchParams(window.location.search);
    const encryptedData = decodeURIComponent(urlParams.get("data") || "");
    const exportedKey = decodeURIComponent(urlParams.get("key") || "");

    if (encryptedData && exportedKey) {
      (async () => {
        const key = await importKey(exportedKey);
        const decryptedData = await decryptData(encryptedData, key);
        setTicketData(JSON.parse(decryptedData));
      })();
    }
  }, []);

  useEffect(() => {
    if (ticketData) {
      const qrCode = new QRCodeStyling({
        width: 250,
        height: 250,
        data: window.location.href,
        image: "/download.png",
        dotsOptions: {
          color: "#28a745",
          type: "square"
        },
        backgroundOptions: {
          color: "#ffffff"
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
          imageSize: 0.4
        }
      });

      qrCode.append(document.getElementById("qrCodeContainer"));
    }
  }, [ticketData]);

  const handleDownloadTicket = () => {
    const ticketElement = document.querySelector('.ticket');
    if (ticketElement) {
      html2canvas(ticketElement).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'ticket.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  if (!ticketData) {
    return <div>Loading...</div>;
  }

  const { name, phone, eventDate, timeBlock } = ticketData;
  const address = new Date(eventDate) < new Date("2024-04-08")
    ? "上海市长宁区利西路143号"
    : "漕河泾开发区公园-东门 上海市徐汇区平果路与桂果路交叉口正南方向33米左右";
  const mapsUrl = new Date(eventDate) < new Date("2024-04-08")
    ? "https://www.google.com/maps?q=上海市长宁区利西路143号"
    : "https://www.google.com/maps?q=漕河泾开发区公园-东门 上海市徐汇区平果路与桂果路交叉口正南方向33米左右";

  return (
    <div className={styles.container}>
      <Head>
        <title>Your Ticket</title>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </Head>
      <div className="ticket">
        <div className="top-part">
          <div className="header">JUICE POP-UP-CAFE</div>
          <div id="qrCodeContainer"></div>
        </div>
        <div className="perforated-line"></div>
        <div className="bottom-part">
          <div className="details">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Date:</strong> {eventDate}</p>
            <p><strong>Time Block:</strong> {timeBlock}</p>
            <p><strong>Address:</strong> <a href={mapsUrl} target="_blank" rel="noopener noreferrer">{address}</a></p>
          </div>
          <div className="message">
            Present this QR code at our POP-UP-CAFE!
          </div>
        </div>
      </div>

      <button onClick={handleDownloadTicket} className={styles.downloadButton}>
        <span className="material-icons">download</span> Download Ticket
      </button>
    </div>
  );
}


