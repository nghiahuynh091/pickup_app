
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useStatus } from '../context/StatusContext';
import { useAuth} from '../context'
import { StatusType } from '../types';

import Button from '../components/ui/Button/Button';

interface UseStatusButtonParams {
    statusType: StatusType;
    toUserId?: string;
    sessionId?: string;
    messageText?: string;
    onStatusCreated?: (documentId: string) => void;
}

export const useStatusButton = (params: UseStatusButtonParams) => {
    
    
    const {
      statusType,
      toUserId,
      sessionId,
      messageText,
      onStatusCreated,
    } = params;


    const {createStatus, isLoading, error} = useStatus();
    const {isAuthenticated, user} = useAuth();
    const handlePress = useCallback( async ()=> {
      // Check authentication
      if (!isAuthenticated || !user) {
        Alert.alert(
          "Authentication Required",
          "Please sign in to update your status."
        );
        return;
      }

      // Validate required fields
      if (!toUserId) {
        Alert.alert(
          "Missing Information",
          "Either recipient user ID or session ID is required."
        );
        return;
      }
      try {

        let coords;
        //future development

        const statusData = {
          statusType,
          toUserId,
          sessionId,
          messageText,
          coords, // undefined for now
        };

        console.log("Creating status with data:", statusData);

        const documentId = await createStatus(statusData);

        if (documentId) {
          Alert.alert(
            "Status Updated",
            `Your ${statusType} status has been sent successfully!`,
            [{ text: "OK" }]
          );
          onStatusCreated?.(documentId);
        } else {
          Alert.alert(
            "Error",
            error || "Failed to update status. Please try again."
          );
        }
      } catch (error) {
        console.error("Error creating status:", error);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }, [params, createStatus, isAuthenticated, user]);
    return {
        onPress: handlePress,
        loading: isLoading,
        error,
    };
}





// Predefined status buttons for common use cases
// export const StatusButtons = {
//   Arriving: (props: Omit<StatusButtonProps, "statusType" | "label">) => (
//     <StatusButton
//       statusType="arriving"
//       label="Arriving"
//       backgroundColor="#4CAF50"
//       {...props}
//     />
//   ),

//   FiveMinLeft: (props: Omit<StatusButtonProps, "statusType" | "label">) => (
//     <StatusButton
//       statusType="5-min-left"
//       label="5-min-left"
//       backgroundColor="#FF9800"
//       {...props}
//     />
//   ),

//   // Away: (props: Omit<StatusButtonProps, 'statusType' | 'label'>) => (
//   //   <StatusButton
//   //     statusType="away"
//   //     label="Away"
//   //     backgroundColor="#FFC107"
//   //     {...props}
//   //   />
//   // ),

//   Arrived: (props: Omit<StatusButtonProps, "statusType" | "label">) => (
//     <StatusButton
//       statusType="arrived"
//       label="Arrived"
//       backgroundColor="#F44336"
//       {...props}
//     />
//   ),

//   // HelpNeeded: (props: Omit<StatusButtonProps, 'statusType' | 'label'>) => (
//   //   <StatusButton
//   //     statusType="help_needed"
//   //     label="Need Help"
//   //     backgroundColor="#9C27B0"
//   //     {...props}
//   //   />
//   // ),
// };

// const styles = StyleSheet.create({
//   button: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginVertical: 4,
//     minWidth: 120,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

