import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, fonts } from '../theme';
import Spinner from '../components/Spinner';
import { API_URL } from '../config';

const StatusPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true); // NEW: Page loading state!
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchMessage, setMatchMessage] = useState(null); 
  
  const [showUnpairModal, setShowUnpairModal] = useState(false);
  const [unpairReason, setUnpairReason] = useState("");
  const [unpairAction, setUnpairAction] = useState('requeue');
  const [loadingUnpair, setLoadingUnpair] = useState(false); 
  
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success', redirect: null });
  
  const isDuplicate = location.state?.isDuplicate;

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/status/${userId}`);
      setStatus(res.data);
    } catch (err) {
      setError("User not found.");
    } finally {
      setLoadingData(false); // Stop the main page loader
    }
  };

  useEffect(() => { fetchStatus(); }, [userId]);

  const handleMatch = async () => {
    setLoadingMatch(true);
    setMatchMessage(null);
    try {
      const res = await axios.post(`${API_URL}/api/match`, { user_id: userId });
      if (res.data.matched) {
        setMatchMessage("Match found! Fetching details...");
        await fetchStatus();
      } else {
        setMatchMessage("No match found yet. Please check back later.");
      }
    } catch (err) {
      setMatchMessage("Error matching. Please try again.");
    } finally {
      setLoadingMatch(false);
    }
  };

  const submitUnpair = async () => {
    if (!unpairReason) {
      alert("Please select a reason");
      return;
    }
    setLoadingUnpair(true);
    try {
      await axios.post(`${API_URL}/api/leave-group`, { 
          user_id: userId, 
          reason: unpairReason,
          delete_profile: unpairAction === 'delete' 
      });
      setShowUnpairModal(false);
      
      if (unpairAction === 'delete') {
         setFeedbackModal({ isOpen: true, title: 'Profile Deleted', message: 'You have been unpaired and your profile has been deleted.', type: 'success', redirect: '/' });
      } else {
         setFeedbackModal({ isOpen: true, title: 'Unpaired Successfully', message: 'You have been unpaired and placed back in the matching queue.', type: 'success', redirect: null });
         await fetchStatus(); 
      }
    } catch (err) {
      alert("Error processing request.");
    } finally {
      setLoadingUnpair(false);
    }
  };

  const closeFeedbackModal = () => {
    const redirect = feedbackModal.redirect;
    setFeedbackModal({ ...feedbackModal, isOpen: false });
    if (redirect) navigate(redirect);
  };

  if (error) return <div style={styles.error}>{error}</div>;

  // NEW ROBUST LOADER: Prevents the blank white screen!
  if (loadingData || !status) {
    return (
      <div style={{...styles.container, justifyContent: 'center', alignItems: 'center'}}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size="50px" color={colors.primary.iris} />
          <h3 style={{ color: colors.primary.berkeleyBlue, marginTop: '20px' }}>Searching... please wait...</h3>
          <p style={{ color: '#666' }}>Fetching your latest profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={styles.card}>
        <div style={styles.header}>
            <h2 style={{ margin: 0 }}>Hello, {status.user.name} 👋</h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>{status.user.program} - {status.user.cohort}</p>
        </div>
        
        <div style={styles.body}>
          {isDuplicate && (
            <div style={styles.duplicateWarning}>
              ⚠️ <strong>You are already registered!</strong><br/>
              We found your existing profile using your email or phone number. Here is your current status below.
            </div>
          )}

          {status.matched ? (
            <div>
              <div style={styles.successBadge}>✓ MATCHED</div>
              <h3 style={{ color: colors.primary.berkeleyBlue }}>Your Group Members:</h3>
              
              {status.group.map((peer, idx) => (
                <div key={idx} style={{ background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: `5px solid ${colors.secondary.electricBlue}` }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{peer.name}</p>
                  <p style={{ margin: '0 0 5px 0', color: '#555', fontSize: '0.9rem' }}>📧 {peer.email}</p>
                  <p style={{ margin: '0 0 10px 0', color: '#555', fontSize: '0.9rem' }}>📌 Prefers: <strong>{peer.meeting_preference || 'All'}</strong></p>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <a href={`https://wa.me/${peer.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: 'white', padding: '8px 15px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>💬 WhatsApp</a>
                      <a href={`https://t.me/+${peer.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ background: '#0088cc', color: 'white', padding: '8px 15px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>✈️ Telegram</a>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '20px', background: '#e3f2fd', padding: '20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #b8daff' }}>
                  <h4 style={{ color: '#0056b3', margin: '0 0 10px 0' }}>🎥 Group Video Room</h4>
                  <p style={{ color: '#004085', fontSize: '0.9rem', marginBottom: '15px' }}>Click below to instantly join a free video call with your group.</p>
                  <a href={`https://meet.jit.si/ALX-PeerFinder-${status.user?.real_id || status.group[0]?.name.replace(/\s/g,'')}`} target="_blank" rel="noreferrer" style={{ background: '#0056b3', color: 'white', padding: '12px 25px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', display: 'inline-block' }}>Join Video Meeting Now</a>
              </div>

              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>Need to make a change?</p>
                  <button onClick={() => setShowUnpairModal(true)} style={styles.unpairBtn}>Unpair / Leave Group</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={styles.pendingBadge}>⏳ IN QUEUE</div>
              <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '20px' }}>You are currently in the queue. We will email you as soon as a match is found. Please click on the button below to search one more time before the email arrives</p>
              
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleMatch} disabled={loadingMatch} style={styles.findBtn}>
                {loadingMatch ? <div style={{display:'flex', justifyContent:'center', gap:'10px'}}><Spinner size="20px" color="white" /> Searching...</div> : "Find Match Now 🔍"}
              </motion.button>
              
              {matchMessage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.noticeBox}>
                  {matchMessage}
                </motion.div>
              )}
              
              <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>No longer need a match?</p>
                  <button onClick={() => { setUnpairAction('delete'); setShowUnpairModal(true); }} style={{...styles.unpairBtn, background: 'transparent', border: `1px solid ${colors.secondary.tomato}`, color: colors.secondary.tomato}}>Cancel Request & Delete Profile</button>
              </div>
            </div>
          )}
        </div>
        <button onClick={() => navigate('/')} style={styles.homeBtn}>Return to Home</button>
      </motion.div>

      {/* --- UNPAIR MODAL --- */}
      <AnimatePresence>
        {showUnpairModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.modalOverlay}>
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} style={styles.modalContent}>
              <h3 style={{ marginTop: 0, color: colors.primary.berkeleyBlue }}>{unpairAction === 'delete' ? 'Delete Request' : 'Unpair Confirmation'}</h3>
              
              {status.matched && (
                  <p style={{ color: '#666', fontSize: '0.95rem' }}>Are you sure you want to unpair? Please let your partner(s) know first to be courteous.</p>
              )}
              
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>Reason for leaving:</label>
                  <select style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }} onChange={(e) => setUnpairReason(e.target.value)} value={unpairReason}>
                      <option value="">-- Select Reason --</option>
                      <option value="Ghosting / Partner didn't show up">Ghosting / Partner didn't show up</option>
                      <option value="Schedule Conflict">Schedule Conflict</option>
                      <option value="Already completed milestone">Already completed milestone</option>
                      <option value="Just Testing the App">Just Testing the App</option>
                      <option value="Other">Other</option>
                  </select>
              </div>
              
              {status.matched && (
                  <div style={{ textAlign: 'left', marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
                      <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>What happens next?</label>
                      <div style={{ marginTop: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                              <input type="radio" name="unpair_action" checked={unpairAction === 'requeue'} onChange={() => setUnpairAction('requeue')} />
                              <span style={{ fontSize: '0.9rem' }}>Put me back in the queue for a new match</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                              <input type="radio" name="unpair_action" checked={unpairAction === 'delete'} onChange={() => setUnpairAction('delete')} />
                              <span style={{ fontSize: '0.9rem', color: colors.secondary.tomato }}>Delete my profile (I no longer need support)</span>
                          </label>
                      </div>
                  </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowUnpairModal(false)} style={{ flex: 1, padding: '10px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }} disabled={loadingUnpair}>Cancel</button>
                  <button onClick={submitUnpair} style={{ flex: 1, padding: '10px', background: colors.secondary.tomato, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center' }} disabled={loadingUnpair}>
                      {loadingUnpair ? <Spinner size="15px" color="white" /> : "Confirm"}
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedbackModal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.modalOverlay}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={styles.modalContent}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{feedbackModal.type === 'success' ? '✅' : '❌'}</div>
              <h2 style={{ color: colors.primary.berkeleyBlue, margin: '0 0 10px 0' }}>{feedbackModal.title}</h2>
              <p style={{ color: '#555', marginBottom: '20px' }}>{feedbackModal.message}</p>
              <button onClick={closeFeedbackModal} style={styles.modalOkBtn}>OK</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f4f6f8', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: fonts.main },
  error: { color: 'red', marginTop: '50px', fontSize: '1.2rem' },
  card: { background: 'white', width: '100%', maxWidth: '600px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  header: { background: colors.primary.berkeleyBlue, color: 'white', padding: '30px 20px', textAlign: 'center' },
  body: { padding: '30px 20px' },
  duplicateWarning: { background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.95rem', border: '1px solid #ffeeba' },
  successBadge: { background: '#d4edda', color: '#155724', padding: '8px 15px', borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '20px' },
  pendingBadge: { background: '#e2e3e5', color: '#383d41', padding: '8px 15px', borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '20px' },
  findBtn: { width: '100%', padding: '15px', background: colors.primary.iris, color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  noticeBox: { marginTop: '15px', padding: '10px', background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' },
  homeBtn: { marginTop: '30px', padding: '12px 24px', background: 'transparent', border: `2px solid ${colors.primary.iris}`, color: colors.primary.iris, borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' },
  retryBtn: { marginTop: '30px', padding: '12px 24px', background: 'white', border: 'none', color: colors.primary.berkeleyBlue, borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 43, 86, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: 'white', padding: '2rem', borderRadius: '15px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  modalOkBtn: { padding: '12px 30px', background: colors.primary.iris, color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' },
  unpairBtn: { padding: '10px 20px', background: 'transparent', border: `1px solid ${colors.secondary.tomato}`, color: colors.secondary.tomato, borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
};

export default StatusPage;
