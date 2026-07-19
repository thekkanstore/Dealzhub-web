import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { getStoreByUserId } from '../../services/storeFirestoreService';
import { getActiveCategories } from '../../services/firestore';
import { ArrowLeft, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../firebase';

const BulkAddProductPage = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  
  const [storeId, setStoreId] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [validCategories, setValidCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [file, setFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validatedData, setValidatedData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchStoreAndCategories = async () => {
      if (user) {
        try {
          const store = await getStoreByUserId(user.providerData[0].uid);
          if (store) {
            setStoreId(store.id);
            setStoreData(store);
            
            // Fetch all active categories
            const allCategories = await getActiveCategories();
            setValidCategories(allCategories);
          } else {
            alert('You need to create a store first!');
            navigate('/vendordetails');
          }
        } catch (error) {
          console.error('Error fetching store:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };

    fetchStoreAndCategories();
  }, [user, navigate]);

  const downloadTemplate = () => {
    const headers = ['name', 'description', 'actualPrice', 'discountPrice', 'categoryName', 'isSecondHand'];
    const csvContent = headers.join(',') + '\n';
    
    // Add a sample row
    const sampleRow = 'Sample Product,A great description,100,80,Electronics,false\n';
    
    const blob = new Blob([csvContent + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bulk_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setValidationErrors([]);
    setValidatedData(null);
    setUploadSuccess(false);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateData(results.data);
      },
      error: (error) => {
        setValidationErrors([`Error parsing CSV: ${error.message}`]);
      }
    });
  };

  const validateData = (data) => {
    const errors = [];
    const validData = [];

    if (data.length === 0) {
      setValidationErrors(['The CSV file is empty.']);
      return;
    }

    data.forEach((row, index) => {
      const rowNum = index + 2; // +1 for header, +1 for 0-index

      if (!row.name || row.name.trim() === '') {
        errors.push(`Row ${rowNum}: Product name is required.`);
      }

      if (!row.categoryName && !row.categoryId) {
        errors.push(`Row ${rowNum} (${row.name}): Category Name is required.`);
      } else {
        // Try to match the category (Strict match first)
        const inputCategory = (row.categoryName || row.categoryId || '').toString().trim().toLowerCase();
        
        let matchedCategory = validCategories.find(c => 
          c.name?.toLowerCase() === inputCategory || 
          c.id?.toLowerCase() === inputCategory
        );

        // Fuzzy Match fallback
        if (!matchedCategory) {
          matchedCategory = validCategories.find(c => {
            const catName = (c.name || '').toLowerCase();
            
            // 1. Simple substring match
            if (catName.includes(inputCategory) || inputCategory.includes(catName)) return true;
            
            // 2. Token based match (e.g. "Electronics" matches "Electronic & Electrical")
            const inputTokens = inputCategory.split(/[\s&,-]+/);
            const catTokens = catName.split(/[\s&,-]+/);
            
            return inputTokens.some(token => {
              if (token.length <= 3) return false; // Ignore short words like "and", "the"
              return catTokens.some(catToken => 
                catToken.length > 3 && (catToken.includes(token) || token.includes(catToken))
              );
            });
          });
        }

        if (!matchedCategory) {
          errors.push(`Row ${rowNum} (${row.name}): Category '${row.categoryName}' does not match any active categories.`);
        } else {
          // Replace categoryName with categoryId for the Cloud Function
          row.categoryId = matchedCategory.id;
          delete row.categoryName; 
        }
      }

      // Basic price validation
      if (isNaN(parseFloat(row.actualPrice))) {
        errors.push(`Row ${rowNum} (${row.name}): Actual Price must be a number.`);
      }

      validData.push(row);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
    } else {
      setValidatedData(validData);
    }
  };

  const handleUpload = async () => {
    if (!validatedData || !storeId) return;

    try {
      setUploading(true);
      
      // Convert validated data back to CSV
      const csvString = Papa.unparse(validatedData);
      const blob = new Blob([csvString], { type: 'text/csv' });
      
      const fileName = `${Date.now()}_bulk_products.csv`;
      const storageRef = ref(storage, `bulk-uploads/${storeId}/${fileName}`);
      
      await uploadBytes(storageRef, blob);
      
      setUploadSuccess(true);
      setFile(null);
      setValidatedData(null);
      
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/vendor/${storeId}`)}
          className="px-4 py-1.5 mb-6 text-sm cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors w-fit flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Store
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bulk Add Products</h1>
          <p className="text-gray-600 mb-8">
            Upload a CSV file to add thousands of products at once. Images can be added later by editing individual products.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Column: Instructions */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Instructions</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Download the CSV template below.</li>
                <li>Fill in your product details without modifying the header row.</li>
                <li>Use the exact Category Names listed below.</li>
                <li>Upload the saved CSV file.</li>
              </ol>

              <div className="mt-6">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-secondaryButtonBackgroundColor text-gray-800 rounded-lg hover:shadow-md transition-all font-medium border border-gray-200"
                >
                  <Download size={18} />
                  Download Template
                </button>
              </div>

              <div className="mt-8 bg-secondaryBackgroundColor p-5 rounded-xl border border-tertiaryTextColor">
                <h4 className="font-semibold text-primaryButtonBackgroundColor mb-2">Available Categories</h4>
                <p className="text-sm text-noFoundTextColor mb-4">You can use either the exact Name or the ID in your CSV:</p>
                
                <div className="bg-white rounded-lg border border-tertiaryTextColor overflow-hidden max-h-64 overflow-y-auto shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondaryBackgroundColor sticky top-0 text-primaryButtonBackgroundColor font-semibold text-xs uppercase border-b border-tertiaryTextColor">
                      <tr>
                        <th className="px-4 py-3">Category Name</th>
                        <th className="px-4 py-3">Category ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tertiaryButtonBackgroundColor">
                      {validCategories.map(cat => (
                        <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-primaryTextColor">{cat.name || 'Unnamed'}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-primaryButtonBackgroundColor select-all">{cat.id}</td>
                        </tr>
                      ))}
                      {validCategories.length === 0 && (
                        <tr>
                          <td colSpan="2" className="px-4 py-4 text-center text-red-500">No categories found in the database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Upload */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Upload CSV</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">Drag and drop your CSV file here, or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer px-6 py-2 bg-primaryButtonBackgroundColor text-white rounded-full hover:shadow-md transition-all font-medium inline-block"
                >
                  Select File
                </label>
                {file && (
                  <p className="mt-3 text-sm font-medium text-gray-900 break-all">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                    <AlertCircle size={18} />
                    <span>Please fix these errors before uploading:</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Success */}
              {validatedData && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <CheckCircle2 size={18} />
                    <span>Ready to Upload!</span>
                  </div>
                  <p className="text-sm text-green-600 mb-4">
                    {validatedData.length} products successfully validated.
                  </p>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-2.5 px-4 bg-primaryButtonBackgroundColor text-white rounded-lg hover:shadow-md transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Uploading...</>
                    ) : (
                      <>Confirm & Upload Products</>
                    )}
                  </button>
                </div>
              )}
              
              {/* Upload Success */}
              {uploadSuccess && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="text-green-600 w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-green-800 text-lg mb-2">Upload Successful!</h3>
                  <p className="text-green-700 text-sm">
                    Your file has been sent to the server. The products are being generated in the background and will appear in your store shortly.
                  </p>
                  <button
                    onClick={() => navigate(`/vendor/${storeId}`)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Return to Store
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAddProductPage;
