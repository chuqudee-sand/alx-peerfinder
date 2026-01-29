import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { colors, fonts } from '../theme';
import Spinner from '../components/Spinner';

const StatusPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [status, setStatus] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchMessage, setMatchMessage] = useState(null); 
  
  // --- UNPAIR STATE ---
  const [showUnpairModal, setShowUnpairModal] = useState(false);
  const [unpairReason, setUnpairReason] = useState("");
  
  const isDuplicate = location.state?.isDuplicate;

  const fetchStatus = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/status/${userId}?t=${Date.now()}`);
      setStatus(res.data);
    } catch (err) {
      console.error("Error fetching status", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
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
      await await axios.post(`${API_URL}/api/leave-group`, { 
        user_id: userId, 
        reason: unpairReason 
      });
      alert("You have left the group.");
      window.location.reload(); 
    } catch (err) {
      alert("Error leaving group.");
    }
  };

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
                style={styles.noticeBox}
              >
                {matchMessage}
              </motion.div>
            )}

            <p style={{fontSize: '0.8rem', color: '#666', marginTop: '10px'}}>
              (Save this ID to check back later)
            </p>
          </div>
        )}

        <button style={styles.homeBtn} onClick={() => navigate('/')}>Back to Home</button>
      </motion.div>

      {/* UNPAIR MODAL */}
      {showUnpairModal && (
        <div style={styles.modalOverlay}>
            <motion.div 
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} 
                style={{...styles.card, maxWidth: '400px', padding: '2rem'}}
            >
                <h3 style={{color:'#d32f2f', marginTop: 0}}>Leave Group? ⚠️</h3>
                <p style={{fontSize:'0.95rem', color: '#555', marginBottom: '15px'}}>
                    This will remove YOU from the group. You will be placed back in the queue to find new peers.
                </p>
                <textarea 
                    placeholder="Reason (Required) - e.g., Peers unresponsive"
                    value={unpairReason} 
                    onChange={e => setUnpairReason(e.target.value)}
                    style={{width:'100%', padding:'10px', marginTop:'10px', borderRadius:'5px', border:'1px solid #ccc', fontFamily: 'inherit'}}
                />
                <div style={{display:'flex', gap:'10px', marginTop:'20px', justifyContent:'center'}}>
                    <button onClick={() => setShowUnpairModal(false)} style={{padding:'10px 20px', border:'1px solid #ccc', background:'white', borderRadius:'5px', cursor:'pointer'}}>Cancel</button>
                    
                    {/* CONFIRM BUTTON (Disabled if reason is empty) */}
                    <button 
                        onClick={handleLeaveGroup} 
                        disabled={!unpairReason.trim()}
                        style={{
                            background: '#d32f2f', 
                            color: 'white', 
                            border: 'none', 
                            padding: '10px 20px', 
                            borderRadius: '5px', 
                            cursor: !unpairReason.trim() ? 'not-allowed' : 'pointer',
                            opacity: !unpairReason.trim() ? 0.5 : 1,
                            fontWeight: 'bold'
                        }}
                    >
                        Confirm Leave
                    </button>
                </div>
            </motion.div>
        </div>
      )}

    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: colors.primary.berkeleyBlue,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '20px', fontFamily: fonts.main
  },
  loadingContainer: {
    minHeight: '100vh', background: colors.primary.berkeleyBlue,
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
  },
  card: {
    background: colors.primary.white,
    padding: '3rem', borderRadius: '20px',
    maxWidth: '600px', width: '100%', textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
  },
  title: { margin: '0 0 1.5rem 0', fontSize: '2rem' },
  subTitle: { color: colors.primary.berkeleyBlue, margin: '0 0 1rem 0' },
  
  // Success
  successBox: {
    background: '#e6fffa', 
    border: `2px solid ${colors.primary.springGreen}`,
    borderRadius: '15px', padding: '20px', textAlign: 'left'
  },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  memberRow: {
    background: 'white', padding: '15px', borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  memberName: { display: 'block', fontWeight: 'bold', fontSize: '1.1rem', color: colors.primary.berkeleyBlue, marginBottom: '5px' },
  contactInfo: { display: 'flex', flexDirection: 'column', fontSize: '0.9rem', color: '#555', gap: '2px' },
  note: { marginTop: '15px', fontStyle: 'italic', fontSize: '0.9rem', color: '#666' },

  // Waiting
  waitingBox: {
    padding: '20px', background: '#f8f9fa', borderRadius: '15px', marginBottom: '20px'
  },
  waitingText: { fontSize: '1.1rem', lineHeight: '1.6', color: '#444', marginBottom: '20px' },
  idBox: {
    background: colors.secondary.electricBlue + '33', 
    padding: '15px', borderRadius: '10px', border: `1px dashed ${colors.secondary.electricBlue}`,
    display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px'
  },
  findBtn: {
    width: '100%', padding: '15px', 
    background: colors.primary.iris, color: 'white',
    border: 'none', borderRadius: '30px', fontWeight: 'bold', 
    fontSize: '1rem', cursor: 'pointer'
  },
  
  // Notice
  noticeBox: {
    marginTop: '15px',
    padding: '10px',
    background: '#fff3cd', 
    color: '#856404',      
    border: '1px solid #ffeeba',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },

  homeBtn: {
    marginTop: '30px', padding: '12px 24px', background: 'transparent',
    border: `2px solid ${colors.primary.iris}`, color: colors.primary.iris,
    borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer',
    transition: 'all 0.3s'
  },

  // Modal
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0, 43, 86, 0.9)', 
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
};

export default StatusPage;