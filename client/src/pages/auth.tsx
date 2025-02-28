import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";
import { useAppStore } from "@/lib/store";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpForm = z.infer<typeof signUpSchema>;
type SignInForm = z.infer<typeof signInSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, setUser } = useAppStore();

  useEffect(() => {
    if (user) {
      setLocation("/chat");
    }
  }, [user, setLocation]);

  const form = useForm<SignUpForm | SignInForm>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isSignUp ? {
        name: "",
        terms: false
      } : {})
    },
  });

  async function onSubmit(data: SignUpForm | SignInForm) {
    setIsLoading(true);
    try {
      // Mock authentication - in a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a mock user
      const newUser = {
        id: crypto.randomUUID(),
        name: isSignUp ? (data as SignUpForm).name : 'Test User',
        email: data.email,
        status: "Hey, I'm using LiveChat!",
        theme: 'system' as const
      };

      setUser(newUser);

      toast({
        title: isSignUp ? "Account created!" : "Welcome back!",
        description: "Redirecting you to the chat...",
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <MessageSquare className="h-8 w-8" />
            <h1 className="text-3xl font-bold">LiveChat</h1>
          </div>
          <CardTitle className="text-center text-2xl">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp 
              ? "Join our community and start chatting" 
              : "Great to see you again! Let's connect"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isSignUp && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        type="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your password" 
                        type="password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isSignUp && (
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I accept the{" "}
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-normal"
                            onClick={(e) => {
                              e.preventDefault();
                              // Handle terms click
                            }}
                          >
                            terms and conditions
                          </Button>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              )}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <Button
              variant="link"
              className="ml-1"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}