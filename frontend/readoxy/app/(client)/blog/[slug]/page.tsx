"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Share2,
  Eye,
  MessageSquare,
  Calendar,
  ThumbsUp,
} from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const dummyContent = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
[... 1000 words of lorem ipsum ...]
`;

const relatedPosts = [
  {
    title: "Getting Started with ServiceNow Development",
    excerpt: "Learn the basics of ServiceNow development and best practices...",
    image: "/blogs/servicenow.jpg",
    author: "Sarah Johnson",
    date: "2024-03-10",
  },
  // Add more related posts
];

export default function BlogPost() {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(156);
  const [showCommentForm, setShowCommentForm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Author and Meta Information */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/authors/john-doe.jpg" alt="John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold">John Doe</h2>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Mar 13, 2024
              </span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                2.5k views
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart
              className={`h-4 w-4 mr-2 ${
                isLiked ? "fill-red-500 text-red-500" : ""
              }`}
            />
            {likes}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Title and Featured Image */}
      <h1 className="text-4xl font-bold mb-6">
        Understanding ServiceNow Integration Patterns
      </h1>
      <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
        <Image
          src="/blogs/servicenow_integration.png"
          alt="ServiceNow Integration"
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <article className="prose prose-lg max-w-none mb-12">
        <p>{dummyContent}</p>
      </article>

      {/* Social Share */}
      <div className="flex items-center justify-center space-x-4 mb-12">
        <Button variant="outline" size="lg" className="flex items-center">
          <FaFacebook className="h-5 w-5 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="lg" className="flex items-center">
          <FaTwitter className="h-5 w-5 mr-2" />
          Tweet
        </Button>
        <Button variant="outline" size="lg" className="flex items-center">
          <FaLinkedin className="h-5 w-5 mr-2" />
          Share
        </Button>
      </div>

      {/* Comments Section */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6">Comments (23)</h3>
        <div className="space-y-6">
          {/* Comment Form */}
          <Card className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src="/avatars/user.jpg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  className="w-full p-3 rounded-lg border min-h-[100px]"
                  placeholder="Write a comment..."
                ></textarea>
                <Button className="mt-2">Post Comment</Button>
              </div>
            </div>
          </Card>

          {/* Comments List */}
          {/* ... existing comment components ... */}
        </div>
      </div>

      {/* Related Posts */}
      <div>
        <h3 className="text-2xl font-bold mb-6">You might also like</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {relatedPosts.map((post, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold mb-2">{post.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
