import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

const page = () => {
    return (
        <div>
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    justifyContent: "space-around",
                    marginTop: "20px",
                }}
            >
                <Card
                    style={{
                        flex: 1,
                        maxWidth: "300px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src="/pro/servicenow.jpg"
                        alt="ServiceNow"
                        style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                        }}
                    />
                    <Link href={"/pro/servicenow"}>
                        <CardHeader>
                            <CardTitle>ServiceNow</CardTitle>
                        </CardHeader>
                    
                    <CardContent>
                        <p>
                            Learn about ServiceNow platform and its
                            capabilities.
                        </p>
                    </CardContent>
                    </Link>
                </Card>
                <Card
                    style={{
                        flex: 1,
                        maxWidth: "300px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src="/pro/java.avif"
                        alt="Java"
                        style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                        }}
                    />
                    <Link href={"/pro/java"}>
                        <CardHeader>
                            <CardTitle>Java</CardTitle>
                        </CardHeader>
                    </Link>
                    <CardContent>
                        <p>
                            Explore Java programming language and its
                            applications.
                        </p>
                    </CardContent>
                </Card>
                <Card
                    style={{
                        flex: 1,
                        maxWidth: "300px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src="/pro/dsa.png"
                        alt="DSA"
                        style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                        }}
                    />
                    <Link href={"/pro/dsa"}>
                        <CardHeader>
                            <CardTitle>DSA</CardTitle>
                        </CardHeader>
                    </Link>
                    <CardContent>
                        <p>Understand Data Structures and Algorithms.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default page;
