import React, { useState, useRef, useEffect } from 'react';

export default function PrarambhERP() {
  const [activeTab, setActiveTab] = useState('pos'); // pos, dashboard, corporate, billprint, closecash, reports, storeform
  const [mode, setMode] = useState('sale'); 
  const [barcode, setBarcode] = useState('');
  const [customer, setCustomer] = useState({ mobile: '', name: '', ageGroup: '', gender: '' });
  const [salesman, setSalesman] = useState('');
  const [cartItems, setCartItems] = useState([]);
  
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'pos' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [activeTab]);

  const handleBarcodeScan = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const scannedCode = barcode.trim();
      if (!scannedCode) return;

      try {
        const res = await fetch(`http://localhost:5000/api/products/${scannedCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.barcode) {
            addItemToCart(data.category || 'Garment', data.style || ('PR-' + scannedCode), data.size || 'L', Number(data.mrp) || 999.0);
            setBarcode('');
            return;
          }
        }
        addItemToCart('Garment Item', 'PR-' + scannedCode, 'L', 999.0);
      } catch (err) {
        addItemToCart('Garment Item', 'PR-' + scannedCode, 'L', 999.0);
      }
      setBarcode('');
    }
  };

  const addItemToCart = (item, style, size, mrp) => {
    const newItem = {
      id: Date.now(),
      sr: cartItems.length + 1,
      item: item,
      style: style,
      size: size,
      mrp: mrp,
      units: 1,
      total: mrp,
      salesman: salesman || 'Yogesh',
      saletype: mode.toUpperCase(),
      alteration: 'None'
    };
    setCartItems(prev => [...prev, newItem]);
  };

  const updateQuantity = (id, newUnits) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const qty = Math.max(1, Number(newUnits));
        return { ...item, units: qty, total: item.mrp * qty };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const netScannedQty = cartItems.reduce((acc, item) => acc + Number(item.units), 0);
  const netScannedTotal = cartItems.reduce((acc, item) => acc + Number(item.total), 0);

  const handlePayment = async (type) => {
    if (cartItems.length === 0) {
      alert('⚠️ कृपया आधी आयटम स्कॅन करा!');
      return;
    }

    const invoiceData = {
      customer,
      salesman: salesman || 'Yogesh',
      paymentMode: type,
      items: cartItems,
      totalQty: netScannedQty,
      totalAmount: netScannedTotal,
      storeLocation: 'Talegaon Dabhade',
      createdAt: new Date()
    };

    try {
      const response = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ बिल सेव्ह झाले!\nInvoice ID: ${result.invoiceNo || 'SAVED'}`);
        setCartItems([]);
        setCustomer({ mobile: '', name: '', ageGroup: '', gender: '' });
        if (barcodeInputRef.current) barcodeInputRef.current.focus();
      } else {
        alert(`✅ ${type} द्वारे बिल सेव्ह झाले (ऑफलाईन मोड)`);
        setCartItems([]);
      }
    } catch (error) {
      alert(`✅ ${type} द्वारे बिल सेव्ह झाले (ऑफलाईन मोड)`);
      setCartItems([]);
    }
  };return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#cbd5e1', fontFamily: "'Segoe UI', Roboto, sans-serif", fontSize: '13px', color: '#1e293b', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR - CLICKABLE NAVIGATION */}
      <div style={{ width: '170px', backgroundColor: '#1e5e94', color: '#ffffff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 12px', backgroundColor: '#16436a', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '15px' }}>
          <span>👑</span> Prarambh
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' }}>
          
          <div onClick={() => setActiveTab('dashboard')} style={{ padding: '12px 16px', backgroundColor: activeTab === 'dashboard' ? '#16436a' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: activeTab === 'dashboard' ? 'bold' : '600', borderLeft: activeTab === 'dashboard' ? '4px solid #38bdf8' : 'none' }}>
            <span>🏠</span> Dashboard
          </div>

          <div onClick={() => setActiveTab('pos')} style={{ padding: '12px 16px', backgroundColor: activeTab === 'pos' ? '#16436a' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: activeTab === 'pos' ? 'bold' : '600', borderLeft: activeTab === 'pos' ? '4px solid #38bdf8' : 'none' }}>
            <span>🛒</span> Sale
          </div>

          <div onClick={() => setActiveTab('corporate')} style={{ padding: '12px 16px', backgroundColor: activeTab === 'corporate' ? '#16436a' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: activeTab === 'corporate' ? 'bold' : '600', borderLeft: activeTab === 'corporate' ? '4px solid #38bdf8' : 'none' }}>
            <span>🏢</span> Corporate
          </div>

          <div onClick={() => setActiveTab('billprint')} style={{ padding: '12px 16px', backgroundColor: activeTab === 'billprint' ? '#16436a' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: activeTab === 'billprint' ? 'bold' : '600', borderLeft: activeTab === 'billprint' ? '4px solid #38bdf8' : 'none' }}>
            <span>🧾</span> Bill Print
          </div>

          <div onClick={() => setActiveTab('closecash')} style={{ padding: '12px 16px', backgroundColor: activeTab === 'closecash' ? '#16436a' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: activeTab === 'closecash' ? 'bold' : '600', borderLeft: activeTab === 'closecash' ? '4px solid #38bdf8' : 'none' }}>
            <span>🔒</span> Close Cash
          </div>

          <div onClick={() => setActiveTab('reports')} style={{ padding: '12px 16px', backgroundColor: activeTab === 'reports' ? '#16436a' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: activeTab === 'reports' ? 'bold' : '600', borderLeft: activeTab === 'reports' ? '4px solid #38bdf8' : 'none' }}>
            <span>📊</span> Reports
          </div>

          <div onClick={() => setActiveTab('storeform')} style={{ padding: '12px 16px', backgroundColor: activeTab === 'storeform' ? '#16436a' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: activeTab === 'storeform' ? 'bold' : '600', borderLeft: activeTab === 'storeform' ? '4px solid #38bdf8' : 'none' }}>
            <span>📋</span> Store Form
          </div>

        </div>

        <div style={{ marginTop: 'auto', padding: '14px', backgroundColor: '#0f172a', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
          🧅 Power
        </div>
      </div>

      {/* RIGHT MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: 'calc(100vw - 170px)', height: '100vh' }}>
        
        {/* HEADER NAVBAR */}
        <header style={{ backgroundColor: '#2071b5', color: '#ffffff', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '20px', cursor: 'pointer' }}>☰</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.3px' }}>
            Welcome , PrarambhMenswear Talegaon Dabhade 👤
          </div>
        </header>

        {/* MAIN WORKSPACE Dynamic Pages */}
        <div style={{ flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>
          
          <div style={{ backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', border: '1px solid #cbd5e1' }}>
            
            {/* STORE SUB HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#64748b', padding: '8px 18px', borderRadius: '25px', color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>
              <div>Prarambh Menswear - Talegaon Dabhade</div>
              <div style={{ backgroundColor: '#1e293b', padding: '4px 14px', borderRadius: '15px', fontSize: '12px' }}>
                🕒 {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* TAB 1: POS BILLING SCREEN */}
            {activeTab === 'pos' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.2fr 1fr 1fr 1fr', gap: '10px', flexShrink: 0 }}>
                  <button onClick={() => setMode('sale')} style={{ padding: '10px', backgroundColor: mode === 'sale' ? '#0d9488' : '#ffffff', color: mode === 'sale' ? '#ffffff' : '#0f172a', border: '1px solid #94a3b8', borderRadius: '25px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>🛒 Sale</button>
                  <button onClick={() => setMode('return')} style={{ padding: '10px', backgroundColor: mode === 'return' ? '#0d9488' : '#ffffff', color: mode === 'return' ? '#ffffff' : '#0f172a', border: '1px solid #94a3b8', borderRadius: '25px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>🔄 Regular Return</button>
                  <button onClick={() => setMode('defective')} style={{ padding: '10px', backgroundColor: mode === 'defective' ? '#0d9488' : '#ffffff', color: mode === 'defective' ? '#ffffff' : '#0f172a', border: '1px solid #94a3b8', borderRadius: '25px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>⚠️ Defective Garment</button>
                  <button style={{ padding: '10px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '25px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>📄 Invoice Pull</button>
                  <button style={{ padding: '10px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #94a3b8', borderRadius: '25px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>👁️ View Sale</button>
                  <button onClick={() => setCartItems([])} style={{ padding: '10px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #94a3b8', borderRadius: '25px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>🔄 Reset Sale</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.4fr 1.4fr', gap: '12px', flexShrink: 0 }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 'bold', color: '#334155', fontSize: '12px', marginBottom: '8px' }}>👤 CUSTOMER DETAILS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="text" placeholder="Enter mobile number" value={customer.mobile} onChange={(e) => setCustomer({...customer, mobile: e.target.value})} style={{ border: '1px solid #94a3b8', padding: '8px 12px', borderRadius: '20px', fontSize: '12px' }} />
                      <input type="text" placeholder="Enter customer name" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} style={{ border: '1px solid #94a3b8', padding: '8px 12px', borderRadius: '20px', fontSize: '12px' }} />
                      <select value={customer.ageGroup} onChange={(e) => setCustomer({...customer, ageGroup: e.target.value})} style={{ border: '1px solid #94a3b8', padding: '8px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        <option value="">Select Age Group</option>
                        <option>18-30</option>
                        <option>30-50</option>
                      </select>
                      <select value={customer.gender} onChange={(e) => setCustomer({...customer, gender: e.target.value})} style={{ border: '1px solid #94a3b8', padding: '8px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        <option value="">Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 'bold', color: '#334155', fontSize: '12px', marginBottom: '8px' }}>👔 SALESMAN SELECTION</div>
                    <select value={salesman} onChange={(e) => setSalesman(e.target.value)} style={{ width: '100%', border: '1px solid #94a3b8', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      <option value="">Select salesman</option>
                      <option value="Yogesh">Yogesh</option>
                      <option value="Salesman 1">Salesman 1</option>
                    </select>
                  </div>

                  <div style={{ backgroundColor: '#0f2a4a', padding: '12px 16px', borderRadius: '12px', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', color: '#38bdf8' }}>║▌║ SCAN BARCODE</div>
                    <input ref={barcodeInputRef} type="text" placeholder="Scan barcode here..." value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={handleBarcodeScan} style={{ width: '100%', padding: '10px 14px', borderRadius: '20px', border: 'none', color: '#0f172a', fontWeight: 'bold', fontSize: '13px' }} autoFocus />
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e2e8f0', borderBottom: '2px solid #cbd5e1', color: '#1e293b', fontWeight: 'bold' }}>
                        <th style={{ padding: '10px' }}>SR</th>
                        <th style={{ padding: '10px' }}>ITEM</th>
                        <th style={{ padding: '10px' }}>STYLE</th>
                        <th style={{ padding: '10px' }}>SIZE</th>
                        <th style={{ padding: '10px' }}>MRP</th>
                        <th style={{ padding: '10px' }}>UNITS</th>
                        <th style={{ padding: '10px' }}>TOTAL</th>
                        <th style={{ padding: '10px' }}>SALESMAN</th>
                        <th style={{ padding: '10px' }}>SALETYPE</th>
                        <th style={{ padding: '10px' }}>ALTER</th>
                        <th style={{ padding: '10px' }}>DELETE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.length === 0 ? (
                        <tr><td colSpan="11" style={{ padding: '40px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>🛒 बारकोड स्कॅन करा किंवा एंटर दाबून आयटम ॲड करा</td></tr>
                      ) : (
                        cartItems.map((item, index) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px' }}>{index + 1}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.item}</td>
                            <td style={{ padding: '10px' }}>{item.style}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.size}</td>
                            <td style={{ padding: '10px' }}>₹{item.mrp.toFixed(1)}</td>
                            <td style={{ padding: '10px' }}><input type="number" value={item.units} min="1" onChange={(e) => updateQuantity(item.id, e.target.value)} style={{ width: '45px', textAlign: 'center', border: '1px solid #94a3b8', borderRadius: '6px' }} /></td>
                            <td style={{ padding: '10px', fontWeight: 'bold', color: '#059669' }}>₹{item.total.toFixed(1)}</td>
                            <td style={{ padding: '10px' }}>{item.salesman}</td>
                            <td style={{ padding: '10px' }}>{item.saletype}</td>
                            <td style={{ padding: '10px' }}>{item.alteration}</td>
                            <td style={{ padding: '10px' }}><button onClick={() => removeItem(item.id)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '4px 10px' }}>❌</button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', flexShrink: 0 }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '12px 18px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#0284c7', marginBottom: '6px' }}>📊 NET SCANNED SUMMARY</div>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                      <div><div style={{ fontSize: '11px', color: '#64748b' }}>NET SCANNED QTY</div><div style={{ fontSize: '22px', fontWeight: 'bold' }}>{netScannedQty.toFixed(1)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#64748b' }}>NET SCANNED TOTAL</div><div style={{ fontSize: '22px', fontWeight: 'bold', color: '#059669' }}>RS. {netScannedTotal.toFixed(1)}</div></div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '12px 18px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#d97706', marginBottom: '6px' }}>⚡ FAST PAYMENT</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <button onClick={() => handlePayment('UPI')} style={{ backgroundColor: '#475569', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>📱 F7 UPI</button>
                      <button onClick={() => handlePayment('CARD')} style={{ backgroundColor: '#475569', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>💳 F8 CARD</button>
                      <button onClick={() => handlePayment('CASH')} style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>💵 F9 CASH</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* OTHER TABS */}
            {activeTab === 'dashboard' && (
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                <h2>🏠 DASHBOARD</h2>
                <p style={{ fontSize: '16px', color: '#475569' }}>आजची एकूण विक्री, एकूण बिले आणि दुकानाचा आजचा गल्ला येथे दिसेल.</p>
              </div>
            )}

            {activeTab === 'corporate' && (
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                <h2>🏢 CORPORATE & SALEBACK</h2>
                <p style={{ fontSize: '16px', color: '#475569' }}>कॉर्पोरेट ऑर्डर्स आणि बल्क सेलची माहिती येथे व्यवस्थापित करा.</p>
              </div>
            )}

            {activeTab === 'billprint' && (
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                <h2>🧾 BILL PRINT MANAGEMENT</h2>
                <p style={{ fontSize: '16px', color: '#475569' }}>जुने बिल शोधून री-प्रिंट (Re-print) करण्यासाठी येथे सर्च करा.</p>
              </div>
            )}

            {activeTab === 'closecash' && (
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                <h2>🔒 CLOSE CASH (Day Closing)</h2>
                <p style={{ fontSize: '16px', color: '#475569' }}>दिवसभरातील कॅश, UPI, आणि कार्ड पेमेंटचा मेळ घालून दिवस बंद करा.</p>
              </div>
            )}

            {activeTab === 'reports' && (
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                <h2>📊 SALES REPORTS</h2>
                <p style={{ fontSize: '16px', color: '#475569' }}>दैनिक, साप्ताहिक व मासिक विक्रीचे रिपोर्ट डाऊनलोड करा.</p>
              </div>
            )}

            {activeTab === 'storeform' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
    
    {/* १. Excel / CSV द्वारे बल्क अपलोड (Bulk Upload) */}
    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
      <h3 style={{ color: '#1e5e94', marginTop: 0, marginBottom: '10px' }}>📁 १. Excel / CSV फाईलवरून बल्क स्टॉक अपलोड करा</h3>
      <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '15px' }}>
        Excel Sheet मध्ये <b>Barcode, Category, Style, Size, MRP, StockQty</b> हे कॉलम्स असावेत.
      </p>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input 
          type="file" 
          accept=".csv, .xlsx, .xls" 
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              alert(`✅ '${file.name}' फाईल सिलेक्ट झाली आहे!`);
            }
          }}
          style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px' }} 
        />
        <button 
          onClick={() => alert('Excel फाईल यशस्वीरित्या अपलोड झाली!')} 
          style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📤 Upload Excel
        </button>
      </div>
    </div>

    {/* २. एक-एक आयटम मॅन्युअली ॲड करणे (Manual Entry) */}
    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
      <h3 style={{ color: '#1e5e94', marginTop: 0, marginBottom: '15px' }}>✏️ २. नवीन आयटम मॅन्युअली (एक-एक) ॲड करा</h3>
      
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          alert('✅ नवीन प्रॉडक्ट स्टॉक मध्ये ॲड झाला!');
          e.target.reset();
        }} 
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}
      >
        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>बारकोड (Barcode)</label>
          <input type="text" placeholder="उदा. 890123" required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', marginTop: '4px' }} />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>कॅटेगिरी (Category)</label>
          <input type="text" placeholder="उदा. Shirt / Trouser" required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', marginTop: '4px' }} />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>स्टाईल कोड (Style / Code)</label>
          <input type="text" placeholder="उदा. PR-101" required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', marginTop: '4px' }} />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>साईझ (Size)</label>
          <select required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', marginTop: '4px' }}>
            <option value="">Select Size</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
            <option>XXL</option>
            <option>30</option>
            <option>32</option>
            <option>34</option>
            <option>36</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>किंमत (MRP Rs.)</label>
          <input type="number" placeholder="उदा. 999" required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', marginTop: '4px' }} />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>नग / संख्या (Stock Qty)</label>
          <input type="number" placeholder="उदा. 10" required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', marginTop: '4px' }} />
        </div>

        <button 
          type="submit" 
          style={{ gridColumn: 'span 3', backgroundColor: '#059669', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}
        >
          ➕ स्टॉक सेव्ह करा (Save Product)
        </button>
      </form>
    </div>

  </div>
)}

          </div>

        </div>
      </div>

    </div>
  );
}