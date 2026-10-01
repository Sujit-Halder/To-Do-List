import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaTrashAlt } from 'react-icons/fa';
import { notify } from '../utils/notifications';

const DEFAULT_IMAGE = 'no-photo.png';

const ProfileImageUploader = ({ currentImage, onUpdate }) => {
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(currentImage || DEFAULT_IMAGE);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setPreview(currentImage || DEFAULT_IMAGE);
  }, [currentImage]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      notify('Your session has expired. Please sign in again.', 'warning');
      navigate('/login');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;

      try {
        setIsUploading(true);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/user/update-image`,
          { image: base64Image },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setPreview(base64Image);
        if (onUpdate) onUpdate(base64Image);
        notify('Profile image updated.', 'success');
      } catch (error) {
        console.error('Upload failed:', error);
        if (error.response?.status === 403) {
          notify('Your session has expired. Please sign in again.', 'warning');
        }
        notify('The image could not be uploaded. Please try again.', 'error');
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      notify('Your session has expired. Please sign in again.', 'warning');
      navigate('/login');
      return;
    }

    try {
      setIsUploading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/delete-image`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setPreview(DEFAULT_IMAGE);
      if (onUpdate) onUpdate(DEFAULT_IMAGE);
    } catch (error) {
      console.error('Delete failed:', error);
      notify('The image could not be removed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="group relative h-20 w-20 overflow-hidden rounded-full border-4 border-white/30 bg-white shadow-md">
      {/* Profile Image */}
      <img src={preview} alt="Profile" className="object-cover w-full h-full" />

      {/* Overlay on hover */}
      <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 text-lg text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current.click()}
          title="Change photo"
          className="hover:text-green-400 transition"
        >
          <FaCamera />
        </button>

        {/* Delete Button (only if not default image) */}
        {preview !== DEFAULT_IMAGE && (
          <button
            onClick={handleDelete}
            title="Remove photo"
            className="hover:text-red-400 transition"
          >
            <FaTrashAlt />
          </button>
        )}
      </div>

      {/* Upload Spinner */}
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      )}

      {/* Hidden Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfileImageUploader;
