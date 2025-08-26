import React, { useEffect, useState } from 'react';
import '../Dashboard.css';
import { mergeOneIntoCache, removeFromCache } from '../cache/receiptsCache';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export default function ReceiptDetail() {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [receipt, setReceipt] = useState(location.state?.receipt || null);
  const [loading, setLoading] = useState(!receipt);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    shop_name: receipt?.shop_name || '',
    location: receipt?.location || '',
    date: receipt?.date || '',
    total_amount: receipt?.total_amount ?? ''
  });

  useEffect(() => {
    async function fetchDetail() {
      if (receipt) return;
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken(true);
        const res = await fetch(`http://localhost:8000/receipts/${receiptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load receipt');
        const data = await res.json();
        setReceipt(data.receipt || null);
      } catch (e) {
        setError(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [receipt, receiptId]);

  return (
    <div style={{padding:20}}>
      <div className="header">
        <h1 className="logo">CHARGETRAILS</h1>
        <div className="header-icons" style={{position:'relative'}}>
          <button className="new-log-btn" onClick={() => navigate('/receipts')}>Back</button>
          <button className="settings-icon" onClick={() => setMenuOpen(v => !v)}>
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>
          {menuOpen && (
            <div style={{position:'absolute', right:0, top:'100%', background:'#333', borderRadius:8, padding:8, minWidth:140}}>
              <button
                className="new-log-btn"
                style={{width:'100%', backgroundColor:'#555', marginBottom:6}}
                onClick={() => { setMenuOpen(false); setEditing(true); }}
              >
                <i className="fa-solid fa-pen" style={{marginRight:8}}></i>
                Edit
              </button>
              <button
                className="new-log-btn"
                style={{width:'100%', backgroundColor:'#8B5E5E'}}
                onClick={async () => {
                  try {
                    setMenuOpen(false);
                    if (!window.confirm('Delete this receipt?')) return;
                    const auth = getAuth();
                    const user = auth.currentUser;
                    if (!user) return;
                    const token = await user.getIdToken(true);
                    const res = await fetch(`http://localhost:8000/receipts/${receiptId}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error('Delete failed');
                    const auth3 = getAuth();
                    const user3 = auth3.currentUser;
                    if (user3) removeFromCache(user3.uid, receiptId);
                    navigate('/receipts');
                  } catch (e) {
                    setError(e.message || 'Error');
                  }
                }}
              >
                <i className="fa-solid fa-trash" style={{marginRight:8}}></i>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{marginTop:120}}>
        {loading && <p>Loading…</p>}
        {error && <p style={{color:'tomato'}}>{error}</p>}
        {receipt && !editing && (
          <div>
            <h2>{receipt.shop_name || 'Unknown Shop'}</h2>
            <div style={{opacity:.7}}>{receipt.location || 'Unknown Location'}</div>
            <div style={{marginTop:8}}>{receipt.date}</div>
            <div style={{fontWeight:600, marginTop:8}}>
              {receipt.total_amount != null ? `$${Number(receipt.total_amount).toFixed(2)}` : '-'}
            </div>

            <h3 style={{marginTop:16}}>Products</h3>
            {Array.isArray(receipt.products) && receipt.products.length > 0 ? (
              <ul>
                {receipt.products.map((p, idx) => (
                  <li key={idx} style={{marginBottom:6}}>
                    <span>{p.Name}</span>
                    {p.Quantity != null && <span> × {Number(p.Quantity)}</span>}
                    {p.Price != null && <span> — ${Number(p.Price).toFixed(2)}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{opacity:.7}}>No products captured.</p>
            )}
          </div>
        )}

        {receipt && editing && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const auth = getAuth();
              const user = auth.currentUser;
              if (!user) return;
              const token = await user.getIdToken(true);
              const res = await fetch(`http://localhost:8000/receipts/${receiptId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  shop_name: form.shop_name,
                  location: form.location,
                  date: form.date,
                  total_amount: form.total_amount === '' ? null : Number(form.total_amount)
                })
              });
              if (!res.ok) throw new Error('Update failed');
              const data = await res.json();
              setReceipt(data.receipt);
              if (data.receipt && data.receipt.timestamp == null) {
                data.receipt.timestamp = Date.now();
              }
              const auth2 = getAuth();
              const user2 = auth2.currentUser;
              if (user2 && data.receipt) mergeOneIntoCache(user2.uid, data.receipt);
              setEditing(false);
            } catch (e) {
              setError(e.message || 'Error');
            }
          }}>
            <div style={{display:'grid', gap:12, maxWidth: 420}}>
              <input value={form.shop_name} onChange={e => setForm({...form, shop_name: e.target.value})} placeholder="Shop name" />
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Location" />
              <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} placeholder="YYYY-MM-DD" />
              <input value={form.total_amount} onChange={e => setForm({...form, total_amount: e.target.value})} placeholder="Total amount" />
              <div style={{display:'flex', gap:10}}>
                <button className="new-log-btn" type="submit">Save</button>
                <button className="new-log-btn" type="button" style={{background:'#555'}} onClick={() => { setEditing(false); setForm({
                  shop_name: receipt?.shop_name || '',
                  location: receipt?.location || '',
                  date: receipt?.date || '',
                  total_amount: receipt?.total_amount ?? ''
                }); }}>Cancel</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


