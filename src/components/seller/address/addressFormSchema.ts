
import * as z from "zod";

export const addressFormSchema = z.object({
  street_address: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  neighborhood: z.string().min(2, "Neighborhood is required"),
  postal_code: z.string().min(2, "Postal/ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

// Default form values
export const defaultAddressFormValues: AddressFormValues = {
  street_address: "",
  city: "",
  neighborhood: "",
  postal_code: "",
  country: "Jordan", // Default to Jordan
  latitude: "",
  longitude: "",
};
