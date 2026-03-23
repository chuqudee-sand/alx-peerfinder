import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { colors, fonts } from '../theme';
import Spinner from '../components/Spinner';
import { API_URL } from '../config';

// --- FULL LIST OF COUNTRIES ---
const africanCountries = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo (Brazzaville)",
  "Congo (Kinshasa)", "Côte d'Ivoire", "Djibouti", "Egypt", "Equatorial Guinea",
  "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea",
  "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi",
  "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger",
  "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles",
  "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania",
  "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe", "Non-African"
];

const countryToTimezone = {
  "Nigeria": "UTC+1", "Kenya": "UTC+3", "South Africa": "UTC+2", "Ghana": "UTC", "Rwanda": "UTC+2", "Egypt": "UTC+2"
};

const utcOffsets = Array.from({ length: 27 }, (_, i) => {
    const offset = i - 12;
    return offset >= 0 ? `+${offset}` : `${offset}`;
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  const program = location.state?.program || 'AiCE';
  const cohort = location.state?.cohort || 'Cohort 17';
  const connectionType = location.state?.connectionType || 'find';

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', country: '', timezone: '', language: '',
    open_to_global_pairing: connectionType === 'offer' ? 'Yes' : 'No', 
    topic_module: '', learning_preferences: '', availability: '', 
    preferred_study_setup: '2', kind_of_support: '', 
    volunteer_capacity: '3',
    meeting_preference: 'All',
    disclaimer_agree: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const name = e.target.name;

    if (name === 'country') {
        if (value === 'Non-African') {
            setFormData({ ...formData, country: value, timezone: '' });
        } else {
            const tz = countryToTimezone[value] || '';
            setFormData({ ...formData, country: value, timezone: tz });
        }
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const getModules = () => {
    return Array.from({length: 12}, (_, i) => `Week ${i+1} Challenge/Project`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData, program, cohort, connection_type: connectionType };
    
    if (connectionType === 'offer') payload.open_to_global_pairing = 'Yes';

    try {
      const response = await axios.post(`${API_URL}/api/register`, payload);
      if (response.data.success || response.data.user_id) {
        navigate(`/status/${response.data.user_id}`, { state: { isDuplicate: response.data.is_duplicate } });
      }
    } catch (error) { alert("Error: " + (error.response?.data?.error || error.message)); } 
    finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/')}>&larr; Back</button>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
        <h2 style={styles.header}>Register for {program} ({cohort})</h2>
        <p style={{textAlign:'center', marginBottom:'15px', color: '#666'}}>Looking to: <strong>{connectionType === 'find' ? 'Find a Study Buddy' : connectionType === 'offer' ? 'Offer Support (Volunteer)' : 'Request Support'}</strong></p>

        <form onSubmit={handleSubmit} style={styles.form}>
           <div style={styles.row}>
             <div style={styles.half}><label style={styles.label}>Full Name</label><input style={styles.input} name="name" onChange={handleChange} required /></div>
             <div style={styles.half}><label style={styles.label}>Email (ALX Registered)</label><input style={styles.input} name="email" type="email" onChange={handleChange} required /></div>
           </div>
           
           <label style={styles.label}>Phone Number (WhatsApp/Telegram)</label>
           <input style={styles.input} name="phone" type="tel" placeholder="+123..." onChange={handleChange} required />

           <div style={styles.row}>
              <div style={styles.half}>
                  <label style={styles.label}>Country</label>
                  <select style={styles.select} name="country" onChange={handleChange} required>
                      <option value="">--Select--</option>
                      {africanCountries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                  </select>
              </div>
              <div style={styles.half}>
                  <label style={styles.label}>Time Zone</label>
                  {formData.country === 'Non-African' ? (
                      <div style={styles.tzWrapper}>
                          <span style={{ fontWeight: 'bold', color: '#555' }}>UTC</span>
                          <select style={styles.tzSelect} name="timezone" onChange={handleChange} required value={formData.timezone}>
                              <option value="">--</option>
                              {utcOffsets.map(off => <option key={off} value={`UTC${off}`}>{off}</option>)}
                          </select>
                      </div>
                  ) : (
                      <input style={{...styles.input, backgroundColor: '#f5f5f5', color: '#888', cursor: 'not-allowed'}} name="timezone" value={formData.timezone} readOnly placeholder="Auto-filled by country" required />
                  )}
              </div>
           </div>

           <div style={styles.row}>
             <div style={styles.half}>
                  <label style={styles.label}>Language</label>
                  <select style={styles.select} name="language" onChange={handleChange} required>
                      <option value="">--Select--</option><option value="English">English</option><option value="French">French</option><option value="Arabic">Arabic</option><option value="Amharic">Amharic</option>
                  </select>
              </div>
             <div style={styles.half}>
                <label style={styles.label}>Availability</label>
                <select style={styles.select} name="availability" onChange={handleChange} required>
                 <option value="">--Select--</option><option value="Morning">Morning</option><option value="Afternoon">Afternoon</option><option value="Evening">Evening</option><option value="Flexible">Flexible</option>
               </select>
             </div>
           </div>

           <div style={styles.row}>
             <div style={styles.half}>
                <label style={styles.label}>Current Week/Module</label>
                <select style={styles.select} name="topic_module" onChange={handleChange} required value={formData.topic_module}>
                    <option value="">--Select--</option>
                    {getModules().map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>
             <div style={styles.half}>
                <label style={styles.label}>Preferred Meeting Method</label>
                <select style={styles.select} name="meeting_preference" onChange={handleChange} required value={formData.meeting_preference}>
                    <option value="All">Any / All</option>
                    <option value="Google Meet">Google Meet / Video</option>
                    <option value="Zoom">Zoom</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                </select>
             </div>
           </div>

           {connectionType === 'offer' ? (
              <div>
                <label style={styles.label}>How many peers can you support? (Volunteers are matched Globally)</label>
                <select style={styles.select} name="volunteer_capacity" onChange={handleChange} required value={formData.volunteer_capacity}>
                    <option value="3">Up to 3 Learners</option>
                    <option value="5">Up to 5 Learners</option>
                    <option value="7">Up to 7 Learners</option>
                    <option value="10">Up to 10 Learners</option>
                </select>
              </div>
           ) : (
              <div>
                <label style={styles.label}>Open to Global Pairing?</label>
                <select style={styles.select} name="open_to_global_pairing" onChange={handleChange} required value={formData.open_to_global_pairing}>
                    <option value="No">No - Match within my Country/Timezone</option>
                    <option value="Yes">Yes - Match me with anyone (Faster)</option>
                </select>
              </div>
           )}

           <div style={styles.checkboxContainer}>
                <input type="checkbox" name="disclaimer_agree" onChange={handleChange} required style={{accentColor: colors.primary.iris}}/>
                <label style={{marginLeft:'10px', fontSize: '0.9rem'}}>
                    I accept the <Link to="/disclaimer" target="_blank" style={{color: colors.primary.iris, textDecoration: 'underline', fontWeight: 'bold'}}>Disclaimer</Link>.
                </label>
           </div>

           <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? <div style={{display:'flex', gap:'10px', justifyContent:'center'}}><Spinner size="20px" /> Processing...</div> : "Submit Request 🚀"}
           </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: colors.primary.berkeleyBlue, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: fonts.main },
  backBtn: { alignSelf: 'flex-start', marginBottom: '20px', background: 'transparent', border: `1px solid ${colors.secondary.electricBlue}`, color: colors.secondary.electricBlue, padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' },
  card: { background: colors.primary.white, padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  header: { textAlign: 'center', color: colors.primary.berkeleyBlue, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  row: { display: 'flex', gap: '15px' },
  half: { flex: 1 },
  label: { fontWeight: '600', fontSize: '0.9rem', color: colors.primary.berkeleyBlue, marginBottom: '5px', display: 'block' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box', outlineColor: colors.secondary.electricBlue },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', backgroundColor: 'white', boxSizing: 'border-box' },
  tzWrapper: { display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #ddd', borderRadius: '8px', paddingLeft: '12px', overflow: 'hidden' },
  tzSelect: { border: 'none', background: 'transparent', width: '100%', padding: '12px 5px', outline: 'none', fontSize: '1rem', cursor: 'pointer' },
  submitButton: { padding: '15px', marginTop: '20px', background: `linear-gradient(45deg, ${colors.primary.iris}, ${colors.secondary.electricBlue})`, border: 'none', borderRadius: '30px', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' },
  checkboxContainer: { display: 'flex', alignItems: 'center', marginTop: '10px' },
};

export default RegisterPage;
