import React from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateSettings } from '../../hooks/useSettings';
import toast from 'react-hot-toast';

const Radius = ({ title = "Radius Settings", id, radiusSettings, missionSettings }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      radius: radiusSettings?.radius || missionSettings?.radius || 10,
    },
  });
  console.log(radiusSettings, "radiusSettings");
  const radius = watch("radius");
  const updateSettings = useUpdateSettings(id);

  const onSubmit = async (data) => {
    const payload = radiusSettings 
      ? { radiusSettings: { radius: data.radius } }
      : { missionSettings: { radius: data.radius } };
      
    updateSettings.mutateAsync(payload, {
      onSuccess: () => {
        toast.success("Radius updated successfully");
      },
      onError: (error) => {
        toast.error("Error updating radius");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-5 bg-white rounded-lg shadow-sm">
      <div className="mb-4 text-center">
        <h2 className="text-[#7d4464] text-xl font-medium">
          {title}: {radius} km
        </h2>
      </div>

      <div className="relative my-4">
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="absolute top-0 h-2 bg-[#7d4464] rounded-full"
            style={{ width: `${(radius / 50) * 100}%` }}
          ></div>
          <div
            className="absolute -translate-x-1/2 -translate-y-1/4"
            style={{
              left: `${(radius / 50) * 100}%`,
              top: '-1px',
            }}
          >
            <div className="w-5 h-5 bg-white border-2 border-[#7d4464] rounded-full shadow-md"></div>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="50"
          {...register("radius", {
            required: true,
            valueAsNumber: true,
          })}
          onChange={(e) => setValue("radius", parseInt(e.target.value))}
          className="absolute top-0 w-full h-2 appearance-none bg-transparent cursor-pointer opacity-0"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="cursor-pointer py-2 px-5 mt-4 text-white font-medium bg-[#7d4464] rounded-full hover:bg-primary/80"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default Radius;
