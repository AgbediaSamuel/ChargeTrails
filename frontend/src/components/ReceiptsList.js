import React, { useEffect, useState, useCallback, useRef } from 'react';
import '../Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { hydrateListFromCache, mergeListIntoCache, removeFromCache } from '../cache/receiptsCache';

function ReceiptRow({ r, onClick, onDelete }) {
  return (
    <div className="card" onClick={onClick} style={{padding: '14px 16px', marginBottom: 10}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap: 10}}>
        <div>
          <div style={{fontWeight:600}}>{r.shop_name || 'Unknown Shop'}</div>
          <div style={{opacity:.7, fontSize:13}}>{r.location || 'Unknown Location'}</div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 12}} onClick={(e) => e.stopPropagation()}>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:600}}>{r.total_amount != null ? `$${Number(r.total_amount).toFixed(2)}` : '-'}</div>
            <div style={{opacity:.7, fontSize:13}}>{r.date}</div>
          </div>
          <button
            aria-label="Delete receipt"
            onClick={onDelete}
            className="new-log-btn"
            style={{backgroundColor:'#8B5E5E', display:'flex', alignItems:'center', justifyContent:'center'}}
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const userUid = auth.currentUser ? auth.currentUser.uid : null;

  const fetchPage = useCallback(async (cursorToken = null) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken(true);
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (cursorToken) params.set('cursor', cursorToken);
      const res = await fetch(`http://localhost:8000/receipts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load receipts');
      const data = await res.json();
      const incoming = data.receipts || [];
      mergeListIntoCache(user.uid, incoming);
      setReceipts(prev => {
        const map = new Map(prev.map(r => [r.receipt_id, r]));
        for (const r of incoming) map.set(r.receipt_id, r);
        return Array.from(map.values());
      });
      setCursor(data.next_cursor || null);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (userUid) {
      const cached = hydrateListFromCache(userUid);
      if (cached.length) setReceipts(cached);
    }
    fetchPage(null);
  }, [fetchPage, userUid]);

  return (
    <div style={{padding: 20}}>
      <div className="header">
        <h1 className="logo">CHARGETRAILS</h1>
        <div className="header-icons">
          <button className="new-log-btn" onClick={() => navigate('/Dashboard')}>Back</button>
        </div>
      </div>
      <div style={{marginTop: 120}}>
        <h2>All Receipts</h2>
        {receipts.map(r => (
          <ReceiptRow
            key={r.receipt_id}
            r={r}
            onClick={() => navigate(`/receipts/${r.receipt_id}`, { state: { receipt: r } })}
            onDelete={async () => {
              try {
                const user = auth.currentUser;
                if (!user) return;
                const token = await user.getIdToken(true);
                const res = await fetch(`http://localhost:8000/receipts/${r.receipt_id}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Delete failed');
                setReceipts(prev => prev.filter(x => x.receipt_id !== r.receipt_id));
                removeFromCache(user.uid, r.receipt_id);
              } catch (e) {
                setError(e.message || 'Error');
              }
            }}
          />
        ))}
        {loading && <p>Loading…</p>}
        {!loading && cursor && (
          <button className="view-all-btn" onClick={() => fetchPage(cursor)}>Load More</button>
        )}
        {!loading && !cursor && receipts.length > 0 && (
          <p style={{opacity:.7}}>No more receipts.</p>
        )}
        {!loading && receipts.length === 0 && !error && (
          <p style={{opacity:.7}}>No receipts yet.</p>
        )}
        {error && <p style={{color:'tomato'}}>{error}</p>}
      </div>
    </div>
  );
}
