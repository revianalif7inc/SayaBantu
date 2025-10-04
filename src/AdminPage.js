import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', description: '' });
  const [editService, setEditService] = useState(null);

  // Fetch data layanan
  useEffect(() => {
    const fetchServices = async () => {
      const response = await axios.get('http://localhost:5000/services', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setServices(response.data);
    };
    fetchServices();
  }, []);

  // Menambah layanan baru
  const handleAddService = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/services', newService, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setNewService({ name: '', description: '' });
    window.location.reload(); // refresh data layanan
  };

  // Mengedit layanan
  const handleEditService = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:5000/services/${editService.id}`, editService, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setEditService(null);
    window.location.reload(); // refresh data layanan
  };

  // Menghapus layanan
  const handleDeleteService = async (id) => {
    await axios.delete(`http://localhost:5000/services/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    window.location.reload(); // refresh data layanan
  };

  return (
    <div>
      <h1>Admin Page</h1>

      {/* Form untuk menambah layanan */}
      <form onSubmit={handleAddService}>
        <h2>Tambah Layanan Baru</h2>
        <input
          type="text"
          placeholder="Nama Layanan"
          value={newService.name}
          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Deskripsi"
          value={newService.description}
          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
          required
        />
        <button type="submit">Tambah Layanan</button>
      </form>

      {/* Form untuk mengedit layanan */}
      {editService && (
        <form onSubmit={handleEditService}>
          <h2>Edit Layanan</h2>
          <input
            type="text"
            value={editService.name}
            onChange={(e) => setEditService({ ...editService, name: e.target.value })}
          />
          <textarea
            value={editService.description}
            onChange={(e) => setEditService({ ...editService, description: e.target.value })}
          />
          <button type="submit">Simpan Perubahan</button>
        </form>
      )}

      {/* Menampilkan layanan yang ada */}
      <h2>Layanan yang Ada</h2>
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <button onClick={() => setEditService(service)}>Edit</button>
            <button onClick={() => handleDeleteService(service.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
