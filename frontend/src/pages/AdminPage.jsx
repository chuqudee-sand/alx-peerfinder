import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, fonts } from '../theme';
import Spinner from '../components/Spinner';
import { API_URL } from '../config';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [programFilter, setProgramFilter] = useState("All");

  const [selectedIds, setSelectedIds] = useState([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const groupsPerPage = 21; 

  const [modal, setModal] = useState({ isOpen: false, type: null, title: '', message: '', isSuccess: false, action: null });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/data`, { password });
      if (res.data.success) {
        setData(res.data);
        setIsAuthenticated(true);
      }
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (endpoint, payload = {}) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, { password, ...payload });
      if (res.data.success) {
        const refresh = await axios.post(`${API_URL}/api/admin/data`, { password });
        setData(refresh.data);
        setModal({ isOpen: true, title: 'Success', message: res.data.message || 'Action completed!', isSuccess: true });
        setSelectedIds([]); 
      } else {
        setModal({ isOpen: true, title: 'Failed', message: res.data.message || 'Action failed', isSuccess: false });
      }
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: err.response?.data?.error || 'Server error', isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    const endpoint = type === 'feedback' ? '/api/admin/download-feedback' : type === 'session_feedback' ? '/api/admin/download-session-feedback' : '/api/admin/download';
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, { password }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_data.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Download failed");
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h2 style={{ color: colors.primary.berkeleyBlue }}>Admin Access</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="password" placeholder="Enter Admin Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
            <button type="submit" style={styles.btnPrimary} disabled={loading}>{loading ? 'Authenticating...' : 'Login'}</button>
          </form>
        </div>
      </div>
    );
  }

  const learners = data?.learners || [];
  const filteredLearners = learners.filter(l => 
    (programFilter === "All" || l.program === programFilter) &&
    (l.name.toLowerCase().includes(filterText.toLowerCase()) || l.email.toLowerCase().includes(filterText.toLowerCase()))
  );

  const matched = filteredLearners.filter(l => l.matched === true);
  const unmatched = filteredLearners.filter(l => l.matched !== true);

  const groups = {};
  matched.forEach(l => {
    if (l.group_id) {
      if (!groups[l.group_id]) groups[l.group_id] = [];
      groups[l.group_id].push(l);
    }
  });

  const groupKeys = Object.keys(groups);
  const indexOfLastGroup = currentGroupPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = groupKeys.slice(indexOfFirstGroup, indexOfLastGroup);
  const totalPages = Math.ceil(groupKeys.length / groupsPerPage);

  const paginate = (pageNumber) => setCurrentGroupPage(pageNumber);

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.sidebar}>
        <h2 style={{ color: 'white', marginBottom: '30px' }}>Admin Panel</h2>
        <button style={activeTab === 'dashboard' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button style={activeTab === 'unmatched' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('unmatched')}>⏳ Unpaired ({unmatched.length})</button>
        <button style={activeTab === 'matched' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('matched')}>✅ Paired Groups</button>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => handleDownload('main')} style={styles.btnSecondary}>📥 Download Data CSV</button>
          <button onClick={() => handleDownload('session_feedback')} style={{...styles.btnSecondary, background: '#17a2b8', color: 'white'}}>📥 Session Feedback CSV</button>
          <button onClick={() => handleDownload('feedback')} style={{...styles.btnSecondary, background: '#e83e8c', color: 'white'}}>📥 App Feedback CSV</button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <input type="text" placeholder="Search learners..." value={filterText} onChange={(e) => setFilterText(e.target.value)} style={styles.searchInput} />
          <select style={styles.filterSelect} value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
            <option value="All">All Programs</option>
            <option value="AiCE">AiCE</option>
            <option value="VA">VA</option>
            <option value="PF">PF</option>
          </select>
        </div>

        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ color: colors.primary.berkeleyBlue }}>Overview</h2>
            
            {/* UPDATED: Main Analytics Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}><h3>{data.stats.total}</h3><p>Total Registered</p></div>
              <div style={styles.statCard}><h3>{data.stats.matched}</h3><p>Total Matched</p></div>
              <div style={styles.statCard}><h3>{data.stats.pending}</h3><p>Waiting in Queue</p></div>
              <div style={styles.statCard}><h3>{data.stats.match_rate}</h3><p>Match Rate</p></div>
              
              {/* NEW ANALYTICS CARDS */}
              <div style={{...styles.statCard, borderTop: `4px solid ${colors.secondary.electricBlue}`}}>
                  <h3 style={{color: colors.secondary.electricBlue}}>{data.stats.tool_rating}</h3>
                  <p>Overall Tool Rating</p>
              </div>
              <div style={{...styles.statCard, borderTop: `4px solid ${colors.primary.iris}`}}>
                  <h3 style={{color: colors.primary.iris}}>{data.stats.match_speed}</h3>
                  <p>Median Match Speed</p>
              </div>
              <div style={{...styles.statCard, borderTop: `4px solid ${colors.secondary.tomato}`}}>
                  <h3 style={{color: colors.secondary.tomato}}>{data.stats.unpaired_need}</h3>
                  <p>Unpaired Needs Support</p>
              </div>
              <div style={{...styles.statCard, borderTop: `4px solid ${colors.secondary.gold}`}}>
                  <h3 style={{color: colors.secondary.gold}}>{data.stats.unpaired_offer}</h3>
                  <p>Unpaired Volunteers</p>
              </div>
            </div>

            <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '10px' }}>
              <h3>Community Health</h3>
              <p>Offering Support: <strong>{data.stats.offer}</strong> | Needing Support: <strong>{data.stats.need}</strong></p>
            </div>
          </motion.div>
        )}

        {activeTab === 'unmatched' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: colors.primary.berkeleyBlue }}>Unpaired Learners</h2>
                <button 
                  style={selectedIds.length >= 2 ? styles.btnPrimary : styles.btnDisabled} 
                  disabled={selectedIds.length < 2 || loading}
                  onClick={() => handleAction('/api/admin/manual-pair', { user_ids: selectedIds })}
                >
                  Manually Pair Selected ({selectedIds.length})
                </button>
            </div>
            
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Cohort</th>
                    <th>Module</th>
                    <th>Connection Type</th>
                    <th>Time Zone</th> {/* NEW COLUMN HEADER */}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unmatched.map(u => (
                    <tr key={u.id}>
                      <td><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelection(u.id)}/></td>
                      <td>{new Date(u.timestamp).toLocaleDateString()}</td>
                      <td>{u.name}</td>
                      <td><span style={styles.badge}>{u.program}</span></td>
                      <td>{u.cohort}</td>
                      <td>{u.topic_module}</td>
                      <td><strong>{u.connection_type.toUpperCase()}</strong></td>
                      <td>{u.timezone || 'N/A'}</td> {/* NEW COLUMN DATA */}
                      <td>
                        <button style={styles.btnAction} onClick={() => handleAction('/api/admin/random-pair', { user_id: u.id })}>Auto-Pair</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'matched' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ color: colors.primary.berkeleyBlue }}>Paired Groups</h2>
            <div style={styles.groupsGrid}>
              {currentGroups.map(gid => (
                <div key={gid} style={styles.groupCard}>
                  <div style={{ background: '#f8f9fa', padding: '10px', borderBottom: '1px solid #eee', fontSize: '0.8rem', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Group ID: {gid.split('-')[1]}...</span>
                      <span>Matched: {new Date(groups[gid][0].matched_timestamp).toLocaleDateString()}</span>
                  </div>
                  <div style={{ padding: '15px' }}>
                      {groups[gid].map(member => (
                        <div key={member.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #eee' }}>
                          <strong>{member.name}</strong> <span style={styles.badge}>{member.program}</span><br/>
                          
                          {/* UPDATED MEMBER META-DATA */}
                          <span style={{ fontSize: '0.85rem', color: '#555' }}>📧 {member.email} | 📱 {member.phone}</span><br/>
                          <span style={{ fontSize: '0.85rem', color: colors.primary.iris }}>
                              Role: <strong>{member.connection_type.toUpperCase()}</strong> | Prefers: <strong>{member.meeting_preference || 'All'}</strong>
                          </span>
                          
                        </div>
                      ))}
                      <button style={styles.btnUnpair} onClick={() => setModal({
                          isOpen: true, type: 'confirm', title: 'Unpair Group?', message: 'This will break the group and put members back in queue.',
                          action: () => handleAction(`/api/unpair/${groups[gid][0].id}`, { reason: 'Admin Forced Unpair' })
                      })}>Break Group</button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <button onClick={() => paginate(currentGroupPage - 1)} disabled={currentGroupPage === 1} style={currentGroupPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}>Previous</button>
                <span style={{ fontWeight: 'bold', color: colors.primary.berkeleyBlue }}>Page {currentGroupPage} of {totalPages}</span>
                <button onClick={() => paginate(currentGroupPage + 1)} disabled={currentGroupPage === totalPages} style={currentGroupPage === totalPages ? styles.pageBtnDisabled : styles.pageBtn}>Next</button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modal.isOpen && (
          <div style={styles.modalOverlay}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={styles.modalContent}>
              <h2 style={{ color: modal.isSuccess ? 'green' : colors.primary.berkeleyBlue }}>{modal.title}</h2>
              <p>{modal.message}</p>
              <div style={styles.modalActions}>
                {modal.type === 'confirm' ? (
                  <>
                    <button style={styles.btnCancel} onClick={() => setModal({ isOpen: false })}>Cancel</button>
                    <button style={styles.btnConfirm} onClick={() => { modal.action(); setModal({ isOpen: false }); }}>Confirm</button>
                  </>
                ) : (
                  <button style={styles.btnConfirm} onClick={() => setModal({ isOpen: false })}>Close</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  loginContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: colors.primary.berkeleyBlue, fontFamily: fonts.main },
  loginCard: { background: 'white', padding: '3rem', borderRadius: '15px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: '12px', background: colors.primary.iris, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  btnDisabled: { padding: '10px 20px', background: '#ccc', color: '#666', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'not-allowed' },
  dashboardContainer: { display: 'flex', height: '100vh', background: '#f4f6f8', fontFamily: fonts.main },
  sidebar: { width: '250px', background: colors.primary.berkeleyBlue, padding: '20px', display: 'flex', flexDirection: 'column' },
  tab: { background: 'transparent', color: 'rgba(255,255,255,0.7)', border: 'none', padding: '15px', textAlign: 'left', fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px' },
  tabActive: { background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '15px', textAlign: 'left', fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px', fontWeight: 'bold' },
  btnSecondary: { padding: '12px', background: 'white', color: colors.primary.berkeleyBlue, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  mainContent: { flex: 1, padding: '30px', overflowY: 'auto' },
  searchInput: { padding: '10px', width: '300px', borderRadius: '8px', border: '1px solid #ddd' },
  filterSelect: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  statCard: { background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  tableContainer: { background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  btnAction: { padding: '5px 10px', background: colors.secondary.electricBlue, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  groupsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  groupCard: { background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  btnUnpair: { width: '100%', padding: '10px', background: '#ffebee', color: '#d32f2f', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: 'white', padding: '2rem', borderRadius: '10px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  modalActions: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' },
  btnConfirm: { padding: '8px 20px', background: colors.primary.iris, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold' },
  btnCancel: { padding: '8px 20px', background: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  badge: { background: '#fff3e0', color: '#e65100', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
  
  // NEW PAGINATION STYLES
  paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px', padding: '10px' },
  pageBtn: { padding: '8px 16px', background: 'white', border: `1px solid ${colors.primary.iris}`, color: colors.primary.iris, borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  pageBtnDisabled: { padding: '8px 16px', background: '#f5f5f5', border: '1px solid #ddd', color: '#aaa', borderRadius: '5px', cursor: 'not-allowed' },
};

export default AdminPage;
