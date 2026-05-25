export const getOptimizedCloudinaryUrl = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url;
  
  // Only optimize cloudinary URLs
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/c_limit,w_${width},f_auto,q_auto/`);
  }
  
  return url;
};
