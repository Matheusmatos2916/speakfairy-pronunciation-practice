
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

const LoginForm: React.FC = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Sign In to SpeakFairy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <p className="text-center text-muted-foreground mb-4">
          Sign in to track your pronunciation progress across devices
        </p>
        
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={loginWithGoogle}
            onError={() => {
              toast.error('Login Failed');
            }}
            theme="filled_blue"
            size="large"
            shape="pill"
            text="continue_with"
            locale="en"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
