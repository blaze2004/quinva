"use client";

import { motion, type Transition } from "framer-motion";
import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next13-progressbar";
import React from "react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const bounceTransition: Transition = {
    y: {
      duration: 0.4,
      ease: "easeOut",
      repeat: 2,
      repeatType: "loop",
    },
  };
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-primary mb-4"
          animate={{ y: ["0%", "-20%", "0%"] }}
          transition={bounceTransition}
        >
          404
        </motion.h1>
        <h2 className="text-2xl md:text-3xl font-semibold  mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Don&apos;t worry, even the calmest minds lose their way sometimes.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href={"/"} className="inline-block">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <HomeIcon className="mr-2 h-4 w-4" /> Home
              </Button>
            </motion.div>
          </Link>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onPointerDown={() => router.back()}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
