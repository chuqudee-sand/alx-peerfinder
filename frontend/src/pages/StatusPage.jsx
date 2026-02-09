import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { colors, fonts } from '../theme';
import Spinner from '../components/Spinner';
import { API_URL } from '../config'; // <--- FIX 1: Import API URL

const StatusPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null); // <--- FIX 2: Add Error State
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchMessage, setMatchMessage] = useState(null); 
  
  // --- UNPAIR STATE ---
  const [showUnpairModal, setShowUnpairModal] = useState(false);
  const [unpairReason, setUnpairReason] = useState("");
  
  const isDuplicate = location.state?.isDuplicate;

  const fetchStatus = async () => {
    try {
      // <--- FIX 3: Changed axios.post to axios.get (Standard for fetching data)
      const res = await axios.get(`${API_URL}/api/status/${userId}?t=${Date.now()}`);
      if (res.data.success) {
        setStatus(res.data);
      } else {
        setError("User not found.");
      }
    } catch (err) {
      console.error("Error fetching status", err);
      // <--- FIX 4: Stop the spinner if error occurs
      setError("Failed to load status. Please check connection.");
    }
  };

  useEffect(() => {
    if (userId) {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Polling every 5s
        return () => clearInterval(interval);
    }
  }, [userId]);

  const handleManualMatch = async () => {
    setLoadingMatch(true);
    setMatchMessage(null); 
    
    try {
      const res = await axios.post(`${API_URL}/api/match`, { user_id: userId });
      if (!res.data.matched) {
        setMatchMessage("No match found yet. Please try again soon!");
      }
      await fetchStatus();
    } catch (err) {
      setMatchMessage("Could not check for matches. Please try again.");
    } finally {
      setLoadingMatch(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.post(`${API_URL}/api/leave-group`, { 
        user_id: userId, 
        reason: unpairReason 
      });
      alert("You have left the group.");
      window.location.reload(); 
    } catch (err) {
      alert("Error leaving group.");
    }
  };

  // <--- FIX 5: Render Error Screen if failed
  if (error) return (
    <div style={styles.loadingContainer}>
       <h3 style={{color: colors.secondary.tomato}}>Error Loading Status</h3>
       <p style={{color: 'white', marginBottom: '20px'}}>{error}</p>
       <button onClick={() => navigate('/')} style={styles.homeBtn}>Back to Home</button>
    </div>
  );

  if (!status) return (
    <div style={styles.loadingContainer}>
       <Spinner size="40px" color={colors.secondary.electricBlue} />
       <p style={{marginTop: '20px', color: 'white'}}>Loading status...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={styles.card}
      >
        {/* === HEADER === */}
        <h1 style={{
          ...styles.title, 
          color: status.matched ? colors.primary.springGreen : colors.secondary.gold
        }}>
          {status.matched 
             ? (isDuplicate ? "You are Already Matched! 🎉" : "It's a Match! 🎉") 
             : (isDuplicate ? "You are Already in Queue ⏳" : "You are in the Queue ⏳")
          }
        </h1>

        {/* === MATCHED STATE === */}
        {status.matched ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={styles.successBox}
          >
            <h3 style={styles.subTitle}>Meet Your Peer Group:</h3>
            <div style={styles.list}>
              {status.group?.map((member, idx) => (
                 <div key={idx} style={styles.memberRow}>
                   <span style={styles.memberName}>{member.name}</span>
                   <div style={styles.contactInfo}>
                     <span>📧 {member.email}</span>
                     <span>📱 {member.phone}</span>
                   </div>
                 </div>
              ))}
            </div>
            <p style={styles.note}>Please contact your peer(s) now. <br />Check your email for more details!</p>

            {/* LEAVE GROUP BUTTON */}
            <div style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px', textAlign: 'center'}}>
                <p style={{fontSize:'0.8rem', color:'#999', marginBottom: '5px'}}>Group inactive?</p>
                <button 
                    onClick={() => setShowUnpairModal(true)}
                    style={{background:'none', border:'none', color:'#d32f2f', textDecoration:'underline', cursor:'pointer', fontSize:'0.85rem'}}
                >
                    Leave Group / Unpair Me
                </button>
            </div>
          </motion.div>
        ) : (
          /* === WAITING STATE === */
          <div style={styles.waitingBox}>
            <p style={styles.waitingText}>
              {isDuplicate 
                ? "You have already registered. We are still looking for a peer who matches your schedule."
                : `Hang tight! We are looking for the perfect peers in ${status.user?.cohort || 'your cohort'} who match your schedule.`
              }
            </p>
            <div style={styles.idBox}>
              <span>Your Unique ID:</span>
              <strong style={{fontSize: '1.2rem', color: colors.primary.berkeleyBlue}}>{userId}</strong>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualMatch} 
              disabled={loadingMatch}
              style={styles.findBtn}
            >
               {loadingMatch ? (
                  <div style={{display:'flex', gap:'10px', alignItems:'center', justifyContent:'center'}}>
                    <Spinner size="18px" /> Finding Match...
                  </div>
               ) : "Find Matches Now 🚀"}
            </motion.button>

            {/* === ORANGE NOTICE MESSAGE === */}
            {matchMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
