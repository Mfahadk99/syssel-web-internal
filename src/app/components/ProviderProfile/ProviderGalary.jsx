import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAddImage,
  useDeleteImages,
} from "@/app/hooks/useGallery";
import {
  useCreateSection,
  useRemoveSection,
} from "@/app/hooks/useSections";
import toast from "react-hot-toast";

const ProviderGalary = ({
  galleryData: initialGalleryData,
  viewerType,
  providerData,
}) => {
  const [galleryData, setGalleryData] = useState(initialGalleryData);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [showAddPhotosModal, setShowAddPhotosModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState([]);

  const queryClient = useQueryClient();

  const { mutate: createSection } = useCreateSection();
  const removeSection = useRemoveSection();
  const { mutate: addImage } = useAddImage();
  const { mutate: deleteImages } = useDeleteImages();

  useEffect(() => {
    if (providerData?._id) {
      queryClient.invalidateQueries({ queryKey: ["gallery", providerData._id] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    }
  }, [providerData?._id, queryClient]);

  useEffect(() => {
    setGalleryData(initialGalleryData);
  }, [initialGalleryData]);

  const handleImageUpload = (e, sectionIndex) => {
    const files = Array.from(e.target.files);
    const newImagesList = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
    }));
    setNewImages(newImagesList);
    setSelectedSection(sectionIndex);
    setShowAddPhotosModal(true);
  };

  const handleSaveImages = async () => {
    const sectionId = galleryData?.projects[selectedSection]?._id;
    const updatedProjects = [...galleryData.projects];
    updatedProjects[selectedSection] = {
      ...updatedProjects[selectedSection],
      images: [...updatedProjects[selectedSection].images, ...newImages],
    };

    const imageUrls = newImages.map((image) => image.url);

    try {
      addImage(
        {
          images: imageUrls,
          providerId: providerData._id,
          sectionId: sectionId,
        },
        {
          onSuccess: () => {
            setGalleryData({
              ...galleryData,
              projects: updatedProjects,
            });
            setShowAddPhotosModal(false);
            setNewImages([]);
            setSelectedSection(null);
            toast.success("Images saved successfully!");
          },
          onError: (error) => {
            toast.error("Failed to save images: " + error.message);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to save images: " + error.message);
    }
  };

  const handleDeleteImage = (sectionIndex, imageIndex) => {
    const sectionId = galleryData?.projects[selectedSection]?._id;
    const updatedProjects = [...galleryData.projects];
    const imageToDelete = updatedProjects[sectionIndex].images[imageIndex];
    updatedProjects[sectionIndex].images = updatedProjects[sectionIndex].images.filter((_, i) => i !== imageIndex);

    setGalleryData({ ...galleryData, projects: updatedProjects });

    deleteImages(
      {
        sectionId: sectionId,
        imageIds: [imageToDelete._id],
      },
      {
        onSuccess: () => {
          toast.success("Image deleted successfully!");
        },
        onError: (error) => {
          toast.error("Failed to delete image: " + error.message);
          setGalleryData(initialGalleryData);
        },
      }
    );
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      const section = galleryData.projects.find((project) => project._id === sectionId);
      if (section && section.images && section.images.length > 0) {
        const imageIds = section.images.map((image) => image._id).filter((id) => id);
        if (imageIds.length > 0) {
          await deleteImages({ providerId: providerData._id, imageIds });
        }
      }

      await removeSection.mutateAsync(sectionId, {
        onSuccess: () => toast.success("Gallery section and all images deleted successfully!"),
        onError: (error) => toast.error("Failed to delete gallery section: " + error.message),
      });
    } catch (error) {
      toast.error("Failed to delete gallery section: " + error.message);
    }
  };

  const ImageModal = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <div className="relative max-w-[90vw] max-h-[85vh]">
        <button onClick={onClose} className="absolute -top-8 right-0 text-white hover:text-gray-300 z-50">
          <X className="w-8 h-8" />
        </button>
        <div className="relative">
          <img src={image.url} alt="" className="max-h-[85vh] w-auto object-contain rounded-lg" />
        </div>
      </div>
    </div>
  );

  const NewSectionModal = () => {
    const [title, setTitle] = useState("");

    const handleCreate = () => {
      if (!title.trim()) return;

      createSection(
        {
          name: title,
          provider: providerData._id,
          isGallery: true,
        },
        {
          onSuccess: () => {
            const updatedGalleryData = {
              ...galleryData,
              projects: [
                ...galleryData.projects,
                { title, images: [] },
              ],
            };
            toast.success("Section created successfully!");
            setGalleryData(updatedGalleryData);
            setSelectedSection(updatedGalleryData.projects.length - 1);
            setShowNewSectionModal(false);
          },
          onError: (error) => {
            toast.error("Failed to create section: " + error.message);
          },
        }
      );
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-96">
          <h3 className="text-xl font-semibold mb-4">Create New Section</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter section title"
            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNewSectionModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button onClick={handleCreate} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90">
              Create
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AddPhotosModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Add Photos</h3>
          <button onClick={() => { setShowAddPhotosModal(false); setNewImages([]); }} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {newImages.map((image, index) => (
            <div key={index} className="relative">
              <img src={image.url} alt="" className="w-full h-40 object-cover rounded-lg" />
              <button onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== index))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={handleSaveImages} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90">
            Save Images
          </button>
        </div>
      </div>
    </div>
  );

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    if (isDeleteMode) setSelectedImageIds([]);
  };

  const handleImageSelect = (imageId) => {
    if (!isDeleteMode) return;

    setSelectedImageIds((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedImageIds.length === 0) return;

    try {
      deleteImages(
        {
          providerId: providerData._id,
          imageIds: selectedImageIds,
        },
        {
          onSuccess: () => {
            const updatedProjects = galleryData.projects.map((project) => ({
              ...project,
              images: project.images.filter((image) => !selectedImageIds.includes(image._id)),
            }));

            setGalleryData({ ...galleryData, projects: updatedProjects });
            toast.success("Images deleted successfully!");
            setSelectedImageIds([]);
            setIsDeleteMode(false);
          },
          onError: (error) => {
            toast.error("Failed to delete images: " + (error.message || "Unknown error"));
          },
        }
      );
    } catch (error) {
      toast.error("Failed to delete images: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Project Gallery</h2>
        {viewerType === "provider" && (
          <button onClick={() => setShowNewSectionModal(true)} className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:bg-[var(--color-primary)]/90 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Section</span>
          </button>
        )}
      </div>

      <div className="space-y-8">
        {galleryData.projects.map((project, projectIndex) => (
          <div key={projectIndex} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{project.title}</h3>
              {viewerType === "provider" && (
                <div className="flex items-center gap-2">
                  {isDeleteMode ? (
                    <>
                      <button onClick={handleBulkDelete} className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors" disabled={selectedImageIds.length === 0}>
                        <X className="w-4 h-4" />
                        <span>Delete Selected ({selectedImageIds.length})</span>
                      </button>
                      <button onClick={toggleDeleteMode} className="text-gray-500 hover:text-gray-700">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={toggleDeleteMode} className="flex items-center gap-1 transition-colors border border-primary text-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white">
                        <span>Delete Images</span>
                      </button>
                      <button onClick={() => handleDeleteSection(project._id)} className="flex items-center gap-1 transition-colors border border-primary text-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white">
                        <X className="w-4 h-4" />
                        <span>Delete Section</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.images.map((image, imageIndex) => (
                <div key={imageIndex} className={`relative group cursor-pointer overflow-hidden rounded-xl ${isDeleteMode && selectedImageIds.includes(image._id) ? "ring-2 ring-red-500" : ""}`} onClick={() => isDeleteMode ? handleImageSelect(image._id) : setSelectedImage(image)}>
                  <div className="aspect-[4/3] relative">
                    <img src={image.url} alt="" className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {isDeleteMode && selectedImageIds.includes(image._id) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-red-500 rounded-full p-1">
                        <X className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {viewerType === "provider" && (
                <label className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, projectIndex)} />
                  <div className="text-center">
                    <Plus className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Add photos</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
      {showNewSectionModal && <NewSectionModal />}
      {showAddPhotosModal && <AddPhotosModal />}
    </div>
  );
};

export default ProviderGalary;
