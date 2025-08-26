import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { auth, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SettingsPage() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setPhotoURL(user?.photoURL || '');
  }, [user]);

  const initials = useMemo(() => {
    const n = (displayName || user?.email || '').trim();
    if (!n) return '?';
    const parts = n.split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts[1]?.[0] || '';
    return (first + last).toUpperCase() || first.toUpperCase();
  }, [displayName, user]);

  async function onSaveProfile() {
    const current = auth.currentUser;
    if (!current) return;
    try {
      setSaving(true);
      await updateProfile(current, { displayName });
      setSaving(false);
    } catch (e) {
      setSaving(false);
      alert(e?.message || 'Failed to save profile');
    }
  }

  async function onSelectPhoto(e) {
    const current = auth.currentUser;
    if (!current) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
      const ct = file.type && file.type.startsWith('image/')
        ? file.type
        : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const objectRef = ref(storage, `profile_photos/${current.uid}/avatar.${ext}`);
      await uploadBytes(objectRef, file, { contentType: ct });
      const url = await getDownloadURL(objectRef);
      await updateProfile(current, { photoURL: url });
      setPhotoURL(url);
    } catch (e) {
      alert(e?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function onRemovePhoto() {
    const current = auth.currentUser;
    if (!current) return;
    try {
      await updateProfile(current, { photoURL: '' });
      setPhotoURL('');
    } catch (e) {
      alert(e?.message || 'Failed to remove photo');
    }
  }

  return (
    <div style={{padding: 20}}>
      <div className="header">
        <h1 className="logo">CHARGETRAILS</h1>
        <div className="header-icons">
          <button className="new-log-btn" onClick={() => navigate('/Dashboard')}>Back</button>
        </div>
      </div>
      <div style={{marginTop: 120, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto'}}>
        <h2>Settings</h2>
        <div className="card" style={{padding: 20}}>
          <div style={{display:'flex', alignItems:'center', gap: 16}}>
            {photoURL ? (
              <img src={photoURL} alt="avatar" style={{width:64, height:64, borderRadius:'50%', objectFit:'cover'}} />
            ) : (
              <div style={{width:64, height:64, borderRadius:'50%', background:'#555', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600}}>
                {initials}
              </div>
            )}
            <div>
              <div style={{opacity:.7, fontSize:13}}>{user?.email}</div>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className="new-log-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading…' : 'Change photo'}</button>
                {photoURL && <button className="new-log-btn" style={{background:'#555'}} onClick={onRemovePhoto}>Remove</button>}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onSelectPhoto} style={{display:'none'}} />
              </div>
            </div>
          </div>
          <div style={{display:'grid', gap: 10, marginTop: 16}}>
            <label style={{opacity:.7, fontSize:13}}>Display name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            <div>
              <button className="new-log-btn" onClick={onSaveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


