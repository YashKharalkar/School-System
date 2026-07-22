import React, { useState } from 'react';
import './StudentDetailsForm.css';
import {
  MdPerson, MdContactPage, MdFace, MdPregnantWoman, MdSupervisorAccount,
  MdSchool, MdFingerprint, MdLocalHospital, MdCameraAlt, MdHistoryEdu
} from 'react-icons/md';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: <MdPerson /> },
  { id: 'contact', label: 'Contact Details', icon: <MdContactPage /> },
  { id: 'father', label: "Father's Details", icon: <MdFace /> },
  { id: 'mother', label: "Mother's Details", icon: <MdPregnantWoman /> },
  { id: 'guardian', label: 'Guardian Details', icon: <MdSupervisorAccount /> },
  { id: 'academic', label: 'Academic Details', icon: <MdSchool /> },
  { id: 'identification', label: 'Identification', icon: <MdFingerprint /> },
  { id: 'medical', label: 'Medical Info', icon: <MdLocalHospital /> }
];

const StudentDetailsForm = ({
  formData,
  isEditable = false,
  isAdmin = false,
  onChange,
  onFileChange,
  photoPreview,
  sigPreview
}) => {
  const [activeTab, setActiveTab] = useState('personal');

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e.target.name, e.target.value);
    }
  };

  const getStatusClass = () => {
    return isEditable ? 'form-control editable' : 'form-control readonly';
  };

  const renderPersonalTab = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          disabled={!isEditable || !isAdmin}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Admission Number (Read-only)</label>
        <input
          type="text"
          name="admission_no"
          value={formData.admission_no || ''}
          disabled={true}
          className="form-control readonly"
        />
      </div>
      <div className="form-group">
        <label>Roll Number</label>
        <input
          type="text"
          name="roll_no"
          value={formData.roll_no || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={formData.dob ? formData.dob.split('T')[0] : ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Gender</label>
        <select
          name="gender"
          value={formData.gender || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label>Blood Group</label>
        <select
          name="blood_group"
          value={formData.blood_group || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        >
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
      </div>
      <div className="form-group">
        <label>Aadhaar Number</label>
        <input
          type="text"
          name="aadhaar_no"
          value={formData.aadhaar_no || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Birth Registration No. (Optional)</label>
        <input
          type="text"
          name="birth_reg_no"
          value={formData.birth_reg_no || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Nationality</label>
        <input
          type="text"
          name="nationality"
          value={formData.nationality || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Religion</label>
        <input
          type="text"
          name="religion"
          value={formData.religion || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Caste</label>
        <input
          type="text"
          name="caste"
          value={formData.caste || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Category</label>
        <select
          name="category"
          value={formData.category || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        >
          <option value="">Select Category</option>
          <option value="General">General</option>
          <option value="OBC">OBC</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
          <option value="EWS">EWS</option>
        </select>
      </div>
      <div className="form-group">
        <label>Mother Tongue</label>
        <input
          type="text"
          name="mother_tongue"
          value={formData.mother_tongue || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Mobile Number</label>
        <input
          type="text"
          name="mobile_no"
          value={formData.mobile_no || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Alternate Mobile Number</label>
        <input
          type="text"
          name="alt_mobile_no"
          value={formData.alt_mobile_no || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Email ID</label>
        <input
          type="email"
          name="email_id"
          value={formData.email_id || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>City</label>
        <input
          type="text"
          name="city"
          value={formData.city || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>District</label>
        <input
          type="text"
          name="district"
          value={formData.district || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>State</label>
        <input
          type="text"
          name="state"
          value={formData.state || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>PIN Code</label>
        <input
          type="text"
          name="pin_code"
          value={formData.pin_code || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group full-width">
        <label>Current Address</label>
        <textarea
          name="current_address"
          value={formData.current_address || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
          rows="2"
        />
      </div>
      <div className="form-group full-width">
        <label>Permanent Address</label>
        <textarea
          name="permanent_address"
          value={formData.permanent_address || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
          rows="2"
        />
      </div>
    </div>
  );

  const renderParentTab = (type) => {
    const prefix = type === 'father' ? 'father' : 'mother';
    const title = type === 'father' ? 'Father' : 'Mother';
    return (
      <div className="form-grid">
        <div className="form-group">
          <label>{title}'s Name</label>
          <input
            type="text"
            name={`${prefix}_name`}
            value={formData[`${prefix}_name`] || ''}
            onChange={handleInputChange}
            disabled={!isEditable}
            className={getStatusClass()}
          />
        </div>
        <div className="form-group">
          <label>{title}'s Occupation</label>
          <input
            type="text"
            name={`${prefix}_occupation`}
            value={formData[`${prefix}_occupation`] || ''}
            onChange={handleInputChange}
            disabled={!isEditable}
            className={getStatusClass()}
          />
        </div>
        <div className="form-group">
          <label>{title}'s Qualification</label>
          <input
            type="text"
            name={`${prefix}_qualification`}
            value={formData[`${prefix}_qualification`] || ''}
            onChange={handleInputChange}
            disabled={!isEditable}
            className={getStatusClass()}
          />
        </div>
        <div className="form-group">
          <label>{title}'s Mobile Number</label>
          <input
            type="text"
            name={type === 'father' ? 'father_mobile' : 'mother_mobile'}
            value={formData[type === 'father' ? 'father_mobile' : 'mother_mobile'] || ''}
            onChange={handleInputChange}
            disabled={!isEditable}
            className={getStatusClass()}
          />
        </div>
        <div className="form-group">
          <label>{title}'s Email ID</label>
          <input
            type="email"
            name={`${prefix}_email`}
            value={formData[`${prefix}_email`] || ''}
            onChange={handleInputChange}
            disabled={!isEditable}
            className={getStatusClass()}
          />
        </div>
        <div className="form-group">
          <label>Aadhaar Number (Optional)</label>
          <input
            type="text"
            name={`${prefix}_aadhaar`}
            value={formData[`${prefix}_aadhaar`] || ''}
            onChange={handleInputChange}
            disabled={!isEditable}
            className={getStatusClass()}
          />
        </div>
      </div>
    );
  };

  const renderGuardianTab = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Guardian Name</label>
        <input
          type="text"
          name="guardian_name"
          value={formData.guardian_name || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Relationship</label>
        <input
          type="text"
          name="guardian_relationship"
          value={formData.guardian_relationship || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Guardian Mobile Number</label>
        <input
          type="text"
          name="guardian_mobile"
          value={formData.guardian_mobile || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group full-width">
        <label>Guardian Address</label>
        <textarea
          name="guardian_address"
          value={formData.guardian_address || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
          rows="2"
        />
      </div>
    </div>
  );

  const renderAcademicTab = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Admission Date</label>
        <input
          type="date"
          name="admission_date"
          value={formData.admission_date ? formData.admission_date.split('T')[0] : ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Admission Class</label>
        <input
          type="text"
          name="admission_class"
          value={formData.admission_class || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Current Class</label>
        <input
          type="text"
          name="class"
          value={formData.class || ''}
          onChange={handleInputChange}
          disabled={!isEditable || !isAdmin} // Read-only for students, admin can change
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Section</label>
        <input
          type="text"
          name="section"
          value={formData.section || ''}
          onChange={handleInputChange}
          disabled={!isEditable || !isAdmin} // Read-only for students, admin can change
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>House</label>
        <input
          type="text"
          name="house"
          placeholder="Red, Blue, Green, Yellow"
          value={formData.house || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Medium of Instruction</label>
        <input
          type="text"
          name="medium_of_instruction"
          value={formData.medium_of_instruction || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>UDISE Number</label>
        <input
          type="text"
          name="udise_no"
          value={formData.udise_no || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Previous School Name</label>
        <input
          type="text"
          name="prev_school_name"
          value={formData.prev_school_name || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group full-width">
        <label>Previous School Address</label>
        <textarea
          name="prev_school_address"
          value={formData.prev_school_address || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
          rows="2"
        />
      </div>
    </div>
  );

  const renderIdentificationTab = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Identification Mark 1</label>
        <input
          type="text"
          name="id_mark_1"
          value={formData.id_mark_1 || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Identification Mark 2</label>
        <input
          type="text"
          name="id_mark_2"
          value={formData.id_mark_2 || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>

      {/* File Uploads (Photo & Signature) */}
      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label>Student Photo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="upload-preview" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px solid #ccc', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}>
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : formData.photo_path ? (
              <img src={`${import.meta.env.VITE_IMAGE_URL}${formData.photo_path}`} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <MdPerson style={{ fontSize: '40px', color: '#ccc' }} />
            )}
          </div>
          {isEditable && (
            <label className="btn-upload" style={{ cursor: 'pointer', padding: '6px 12px', background: '#e3f2fd', color: '#1565c0', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MdCameraAlt /> Change Photo
              <input type="file" name="photo" accept="image/*" onChange={(e) => onFileChange(e)} hidden />
            </label>
          )}
        </div>
      </div>

      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label>Student Signature</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="upload-preview" style={{ width: '150px', height: '60px', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}>
            {sigPreview ? (
              <img src={sigPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : formData.signature_path ? (
              <img src={`${import.meta.env.VITE_IMAGE_URL}${formData.signature_path}`} alt="Signature" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>No Signature</span>
            )}
          </div>
          {isEditable && (
            <label className="btn-upload" style={{ cursor: 'pointer', padding: '6px 12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MdHistoryEdu /> Upload Signature
              <input type="file" name="signature" accept="image/*" onChange={(e) => onFileChange(e)} hidden />
            </label>
          )}
        </div>
      </div>
    </div>
  );

  const renderMedicalTab = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Disability (if any)</label>
        <input
          type="text"
          name="disability"
          value={formData.disability || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Emergency Contact Person</label>
        <input
          type="text"
          name="emergency_contact_person"
          value={formData.emergency_contact_person || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group">
        <label>Emergency Contact Number</label>
        <input
          type="text"
          name="emergency_contact_no"
          value={formData.emergency_contact_no || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
        />
      </div>
      <div className="form-group full-width">
        <label>Allergies</label>
        <textarea
          name="allergies"
          value={formData.allergies || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
          rows="2"
        />
      </div>
      <div className="form-group full-width">
        <label>Chronic Medical Conditions</label>
        <textarea
          name="medical_conditions"
          value={formData.medical_conditions || ''}
          onChange={handleInputChange}
          disabled={!isEditable}
          className={getStatusClass()}
          rows="2"
        />
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalTab();
      case 'contact': return renderContactTab();
      case 'father': return renderParentTab('father');
      case 'mother': return renderParentTab('mother');
      case 'guardian': return renderGuardianTab();
      case 'academic': return renderAcademicTab();
      case 'identification': return renderIdentificationTab();
      case 'medical': return renderMedicalTab();
      default: return renderPersonalTab();
    }
  };

  return (
    <div className="student-details-form-container">
      {/* Tab Navigation */}
      <div className="tabs-nav-scroll" style={{ overflowX: 'auto', display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary-dark)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--primary-dark)' : '#666',
              fontWeight: activeTab === tab.id ? '600' : 'normal',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              fontSize: '14px'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content" style={{ minHeight: '300px' }}>
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default StudentDetailsForm;
